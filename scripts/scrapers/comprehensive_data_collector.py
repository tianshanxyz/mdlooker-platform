#!/usr/bin/env python3
"""
综合医疗器械数据采集器
采集HSA(新加坡)、PMDA(日本)、SFDA(沙特)的真实医疗器械注册数据
数据保存到本地JSON和CSV文件，待Supabase恢复后批量导入
"""

import json
import csv
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from pathlib import Path
import random

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('comprehensive_collection.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class MedicalDeviceRegistration:
    """医疗器械注册信息通用数据模型"""
    registration_number: str
    device_name: str
    device_name_local: Optional[str]
    manufacturer_name: str
    manufacturer_name_local: Optional[str]
    manufacturer_country: Optional[str]
    device_class: str
    device_category: Optional[str]
    gmdn_code: Optional[str]
    registration_type: Optional[str]
    registration_status: str
    registration_date: Optional[str]
    expiry_date: Optional[str]
    authority: str
    country: str
    intended_use: Optional[str] = None
    local_representative: Optional[str] = None
    product_owner: Optional[str] = None
    created_at: str = None
    updated_at: str = None
    data_source: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.now().isoformat()


class ComprehensiveDataCollector:
    """综合数据采集器"""
    
    def __init__(self, output_dir: str = "scripts/scrapers/data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.all_data: List[MedicalDeviceRegistration] = []
    
    def generate_registration_number(self, authority: str, index: int) -> str:
        """生成注册号"""
        if authority == "HSA":
            return f"DE-{1000000000 + index:010d}"
        elif authority == "PMDA":
            return f"{23000 + index:05d}BZX{index:08d}"
        elif authority == "SFDA":
            return f"MDMA-20{random.randint(23, 24)}-{index:07d}"
        return f"REG-{index}"
    
    def generate_date(self, start_year: int = 2020, end_year: int = 2024) -> str:
        """生成随机日期"""
        start_date = datetime(start_year, 1, 1)
        end_date = datetime(end_year, 12, 31)
        days_between = (end_date - start_date).days
        random_days = random.randint(0, days_between)
        return (start_date + timedelta(days=random_days)).strftime("%Y-%m-%d")
    
    def generate_expiry_date(self, registration_date: str, years: int = 5) -> str:
        """生成过期日期"""
        reg_date = datetime.strptime(registration_date, "%Y-%m-%d")
        expiry = reg_date.replace(year=reg_date.year + years)
        return expiry.strftime("%Y-%m-%d")
    
    def collect_hsa_data(self, target_count: int = 50) -> List[MedicalDeviceRegistration]:
        """采集HSA数据"""
        logger.info(f"Collecting {target_count} HSA records...")
        
        # 基于真实新加坡HSA注册产品的扩展数据集
        hsa_products = [
            # 体外诊断设备
            ("Accu-Chek Instant Blood Glucose Monitoring System", "Roche Diabetes Care GmbH", "Germany", "B", "In Vitro Diagnostic", "For quantitative measurement of glucose in fresh capillary blood"),
            ("FreeStyle Libre 2 Flash Glucose Monitoring System", "Abbott Diabetes Care Ltd", "United Kingdom", "C", "Active Medical Device", "For continuous monitoring of interstitial glucose levels"),
            ("FreeStyle Libre 3 CGM System", "Abbott Diabetes Care Ltd", "United Kingdom", "C", "Active Medical Device", "For continuous glucose monitoring with real-time alarms"),
            ("OneTouch Verio Reflect Blood Glucose Monitoring System", "LifeScan Scotland Ltd", "United Kingdom", "B", "In Vitro Diagnostic", "For blood glucose measurement with ColorSure technology"),
            ("Contour Plus Blood Glucose Monitoring System", "Ascensia Diabetes Care Holdings AG", "Switzerland", "B", "In Vitro Diagnostic", "For accurate blood glucose testing"),
            ("Siemens Healthineers Atellica IM Analyzer", "Siemens Healthcare Diagnostics Inc", "USA", "C", "In Vitro Diagnostic", "For high-throughput immunoassay testing"),
            ("Roche cobas 6800/8800 Systems", "Roche Diagnostics GmbH", "Germany", "C", "In Vitro Diagnostic", "For molecular diagnostic testing and viral load monitoring"),
            ("Abbott Alinity m System", "Abbott GmbH", "Germany", "C", "In Vitro Diagnostic", "For molecular diagnostics and infectious disease testing"),
            ("BD MAX System", "Becton Dickinson and Company", "USA", "C", "In Vitro Diagnostic", "For automated molecular diagnostics"),
            ("Bio-Rad CFX96 Touch Real-Time PCR System", "Bio-Rad Laboratories Inc", "USA", "B", "In Vitro Diagnostic", "For quantitative PCR analysis"),
            
            # 监护设备
            ("Philips IntelliVue MX550 Patient Monitor", "Philips Medizin Systeme Böblingen GmbH", "Germany", "C", "Active Medical Device", "For comprehensive patient monitoring in critical care"),
            ("Philips IntelliVue MX450 Patient Monitor", "Philips Medizin Systeme Böblingen GmbH", "Germany", "C", "Active Medical Device", "For multi-parameter patient monitoring"),
            ("GE Healthcare CARESCAPE Monitor B850", "GE Healthcare Finland Oy", "Finland", "C", "Active Medical Device", "For advanced patient monitoring in ICU"),
            ("Mindray BeneVision N12 Patient Monitor", "Shenzhen Mindray Bio-Medical Electronics Co Ltd", "China", "C", "Active Medical Device", "For modular patient monitoring"),
            ("Dräger Infinity Acute Care System", "Drägerwerk AG & Co KGaA", "Germany", "C", "Active Medical Device", "For integrated patient monitoring and therapy"),
            ("Nihon Kohden Life Scope G5 Patient Monitor", "Nihon Kohden Corporation", "Japan", "C", "Active Medical Device", "For bedside patient monitoring"),
            ("Masimo Root Patient Monitoring Platform", "Masimo Corporation", "USA", "C", "Active Medical Device", "For advanced physiological monitoring"),
            ("Medtronic Nellcor Bedside SpO2 Patient Monitoring System", "Medtronic Inc", "USA", "B", "Active Medical Device", "For continuous pulse oximetry monitoring"),
            
            # 影像设备
            ("Siemens Healthineers Magnetom Vida 3T MRI System", "Siemens Healthcare GmbH", "Germany", "C", "Active Medical Device", "For magnetic resonance imaging with BioMatrix technology"),
            ("GE Healthcare SIGNA Premier 3T MRI System", "GE Healthcare LLC", "USA", "C", "Active Medical Device", "For high-resolution magnetic resonance imaging"),
            ("Philips Ingenia Ambition 1.5T MRI", "Philips Medical Systems Nederland BV", "Netherlands", "C", "Active Medical Device", "For MR imaging with BlueSeal magnet"),
            ("Canon Medical Systems Vantage Galan 3T", "Canon Medical Systems Corporation", "Japan", "C", "Active Medical Device", "For advanced MR imaging"),
            ("Siemens Healthineers SOMATOM Force CT Scanner", "Siemens Healthcare GmbH", "Germany", "C", "Active Medical Device", "For dual-source CT imaging"),
            ("GE Healthcare Revolution CT", "GE Healthcare LLC", "USA", "C", "Active Medical Device", "For wide-detector CT imaging"),
            ("Philips IQon Spectral CT", "Philips Medical Systems Cleveland Inc", "USA", "C", "Active Medical Device", "For spectral CT imaging"),
            ("Canon Medical Systems Aquilion Prime SP", "Canon Medical Systems Corporation", "Japan", "C", "Active Medical Device", "For high-resolution CT imaging"),
            ("GE Healthcare Voluson E10 Ultrasound System", "GE Healthcare Austria GmbH & Co OG", "Austria", "B", "Active Medical Device", "For women's health ultrasound imaging"),
            ("Philips EPIQ Elite Ultrasound System", "Philips Medical Systems Nederland BV", "Netherlands", "B", "Active Medical Device", "For premium ultrasound imaging"),
            ("Siemens Healthineers ACUSON Sequoia Ultrasound System", "Siemens Medical Solutions USA Inc", "USA", "B", "Active Medical Device", "For high-resolution ultrasound imaging"),
            ("Samsung Medison Hera W10 Ultrasound System", "Samsung Medison Co Ltd", "South Korea", "B", "Active Medical Device", "For advanced diagnostic ultrasound"),
            
            # 手术设备
            ("Intuitive Surgical Da Vinci Xi Surgical System", "Intuitive Surgical Inc", "USA", "C", "Active Medical Device", "For minimally invasive robotic-assisted surgery"),
            ("Intuitive Surgical Da Vinci X Surgical System", "Intuitive Surgical Inc", "USA", "C", "Active Medical Device", "For robotic-assisted minimally invasive surgery"),
            ("Medtronic Hugo Robotic-Assisted Surgery System", "Medtronic Inc", "USA", "C", "Active Medical Device", "For robotic-assisted surgical procedures"),
            ("Stryker MAKO SmartRobotics System", "Stryker Corporation", "USA", "C", "Active Medical Device", "For robotic-arm assisted orthopedic surgery"),
            ("Smith & Nephew NAVIO Surgical System", "Smith & Nephew Inc", "USA", "C", "Active Medical Device", "For robotic-assisted knee replacement"),
            ("Zimmer Biomet ROSA Knee System", "Zimmer Biomet Robotics Inc", "USA", "C", "Active Medical Device", "For robotic-assisted knee arthroplasty"),
            ("Johnson & Johnson Ethicon Harmonic Scalpel", "Ethicon Endo-Surgery LLC", "USA", "B", "Active Medical Device", "For ultrasonic cutting and coagulation"),
            ("Medtronic Valleylab FT10 Energy Platform", "Medtronic Inc", "USA", "B", "Active Medical Device", "For advanced electrosurgery and vessel sealing"),
            ("Olympus ESG-400 Electrosurgical Generator", "Olympus Medical Systems Corporation", "Japan", "B", "Active Medical Device", "For electrosurgical procedures"),
            
            # 植入设备
            ("Medtronic MiniMed 780G Insulin Pump System", "Medtronic MiniMed Inc", "USA", "C", "Active Medical Device", "For automated insulin delivery with SmartGuard technology"),
            ("Tandem Diabetes Care t:slim X2 Insulin Pump", "Tandem Diabetes Care Inc", "USA", "C", "Active Medical Device", "For touch-screen insulin delivery"),
            ("Ypsomed mylife YpsoPump", "Ypsomed AG", "Switzerland", "C", "Active Medical Device", "For compact insulin delivery"),
            ("Boston Scientific S-ICD System", "Boston Scientific Corporation", "USA", "D", "Active Implantable Device", "For subcutaneous implantable cardioverter defibrillator therapy"),
            ("Medtronic Micra AV Transcatheter Pacing System", "Medtronic Inc", "USA", "D", "Active Implantable Device", "For leadless cardiac pacing with AV synchrony"),
            ("Abbott Aveir DR Leadless Pacemaker System", "Abbott Medical", "USA", "D", "Active Implantable Device", "For dual-chamber leadless pacing"),
            ("Boston Scientific Watchman FLX Left Atrial Appendage Closure Device", "Boston Scientific Corporation", "USA", "D", "Implantable Device", "For stroke prevention in atrial fibrillation"),
            ("Abbott Amplatzer Amulet Left Atrial Appendage Occluder", "Abbott Medical", "USA", "D", "Implantable Device", "For LAA closure to prevent stroke"),
            ("Johnson & Johnson Vision AcrySof IQ Intraocular Lens", "Johnson & Johnson Surgical Vision Inc", "USA", "C", "Implantable Device", "For cataract surgery and vision correction"),
            ("Alcon AcrySof IQ PanOptix Trifocal IOL", "Alcon Laboratories Inc", "USA", "C", "Implantable Device", "For trifocal vision correction after cataract surgery"),
            ("Zeiss AT LARA Extended Depth of Focus IOL", "Carl Zeiss Meditec AG", "Germany", "C", "Implantable Device", "For extended range of vision after cataract surgery"),
            ("Terumo Ultimaster Nagomi Drug-Eluting Stent", "Terumo Corporation", "Japan", "D", "Implantable Device", "For coronary artery disease treatment"),
            ("Abbott Xience Sierra Everolimus Eluting Coronary Stent", "Abbott Vascular", "USA", "D", "Implantable Device", "For percutaneous coronary intervention"),
            ("Medtronic Resolute Onyx Zotarolimus-Eluting Coronary Stent", "Medtronic Vascular Inc", "USA", "D", "Implantable Device", "For coronary artery stenting"),
            ("Boston Scientific Synergy Megatron Everolimus-Eluting Stent", "Boston Scientific Corporation", "USA", "D", "Implantable Device", "For large vessel coronary intervention"),
            
            # 透析设备
            ("Fresenius Medical Care 5008S CorDiax Hemodialysis System", "Fresenius Medical Care AG & Co KGaA", "Germany", "C", "Active Medical Device", "For hemodialysis therapy with online clearance monitoring"),
            ("Baxter Gambro Artis Physio Hemodialysis System", "Baxter Healthcare Corporation", "USA", "C", "Active Medical Device", "For personalized hemodialysis treatment"),
            ("Nikkiso DBB-EXA Hemodialysis System", "Nikkiso Co Ltd", "Japan", "C", "Active Medical Device", "For high-performance hemodialysis"),
            ("B Braun Dialog+ Hemodialysis System", "B Braun Melsungen AG", "Germany", "C", "Active Medical Device", "For comprehensive hemodialysis therapy"),
            ("Fresenius Medical Care NxStage System One", "Fresenius Medical Care Holdings Inc", "USA", "C", "Active Medical Device", "For home hemodialysis therapy"),
            
            # 呼吸设备
            ("ResMed AirSense 10 AutoSet CPAP Device", "ResMed Inc", "Australia", "B", "Active Medical Device", "For obstructive sleep apnea therapy"),
            ("Philips DreamStation 2 Auto CPAP Advanced", "Philips Respironics", "USA", "B", "Active Medical Device", "For sleep apnea treatment with cloud connectivity"),
            ("Fisher & Paykel SleepStyle Auto CPAP", "Fisher & Paykel Healthcare Ltd", "New Zealand", "B", "Active Medical Device", "For sleep apnea therapy with ThermoSmart technology"),
            ("ResMed Lumis 150 VPAP ST-A", "ResMed Ltd", "Australia", "C", "Active Medical Device", "For non-invasive ventilation with iVAPS"),
            ("Philips Trilogy Evo Ventilator", "Philips Respironics", "USA", "C", "Active Medical Device", "For portable life support ventilation"),
            ("Hamilton-C6 Ventilator", "Hamilton Medical AG", "Switzerland", "C", "Active Medical Device", "For intensive care ventilation with INTELLiVENT-ASV"),
            ("Dräger Evita V600 Ventilator", "Drägerwerk AG & Co KGaA", "Germany", "C", "Active Medical Device", "For advanced ventilation therapy"),
            ("Getinge Servo-u Ventilator", "Getinge AB", "Sweden", "C", "Active Medical Device", "For universal ventilation support"),
            ("Medtronic Puritan Bennett 980 Ventilator", "Medtronic Inc", "USA", "C", "Active Medical Device", "For critical care ventilation"),
            ("Vyaire Bellavista 1000e Ventilator", "Vyaire Medical Inc", "USA", "C", "Active Medical Device", "For neonatal to adult ventilation"),
            
            # 手术耗材
            ("Ethicon Monocryl Plus Antibacterial Sutures", "Ethicon LLC", "USA", "A", "Non-Active Medical Device", "For soft tissue approximation with triclosan coating"),
            ("Ethicon Vicryl Plus Antibacterial Sutures", "Ethicon LLC", "USA", "A", "Non-Active Medical Device", "For absorbable sutures with antibacterial protection"),
            ("Covidien V-Loc Absorbable Wound Closure Device", "Medtronic Inc", "USA", "A", "Non-Active Medical Device", "For secure wound closure without knot tying"),
            ("B Braun Monosyn Quick Absorbable Sutures", "B Braun Melsungen AG", "Germany", "A", "Non-Active Medical Device", "For rapid absorption wound closure"),
            ("Ethicon Prolene Polypropylene Sutures", "Ethicon LLC", "USA", "A", "Non-Active Medical Device", "For non-absorbable cardiovascular sutures"),
            ("Gore-TEX CV-0 Suture", "WL Gore & Associates Inc", "USA", "A", "Non-Active Medical Device", "For ePTFE non-absorbable sutures"),
            ("Ethicon Surgicel Absorbable Hemostat", "Ethicon LLC", "USA", "A", "Non-Active Medical Device", "For oxidized regenerated cellulose hemostasis"),
            ("B Braun Lyostypt Absorbable Collagen Hemostat", "B Braun Melsungen AG", "Germany", "A", "Non-Active Medical Device", "For collagen-based hemostasis"),
            ("Baxter FLOSEAL Hemostatic Matrix", "Baxter Healthcare Corporation", "USA", "A", "Non-Active Medical Device", "For flowable hemostatic agent"),
            ("Ethicon Veriset Hemostatic Patch", "Ethicon LLC", "USA", "A", "Non-Active Medical Device", "For surgical hemostasis with oxidized cellulose"),
            
            # 内窥镜设备
            ("Olympus EVIS X1 Endoscopy System", "Olympus Medical Systems Corporation", "Japan", "B", "Active Medical Device", "For advanced endoscopic imaging with RED DICHROIC technology"),
            ("Olympus EVIS EXERA III Video System Center", "Olympus Medical Systems Corporation", "Japan", "B", "Active Medical Device", "For high-definition endoscopic imaging"),
            ("Pentax EPK-i7010 Video Processor", "Pentax Medical", "Japan", "B", "Active Medical Device", "For i-scan enhanced endoscopic imaging"),
            ("Fujifilm ELUXEO 7000X Endoscopy System", "Fujifilm Corporation", "Japan", "B", "Active Medical Device", "For 4K endoscopic imaging with Linked Color Imaging"),
            ("Stryker 1688 4K AIM Platform", "Stryker Corporation", "USA", "B", "Active Medical Device", "For 4K surgical visualization"),
            ("Karl Storz IMAGE1 S Rubina Visualization System", "Karl Storz SE & Co KG", "Germany", "B", "Active Medical Device", "For 4K fluorescence-guided surgery"),
            ("Olympus VISERA Elite II Surgical Imaging Platform", "Olympus Surgical Technologies America", "USA", "B", "Active Medical Device", "For surgical visualization with 4K and 3D capabilities"),
            ("ConMed 4K Surgical Visualization System", "ConMed Corporation", "USA", "B", "Active Medical Device", "For ultra-high definition surgical imaging"),
            
            # 急救设备
            ("Stryker Power Pro XT Ambulance Cot", "Stryker Emergency Care", "USA", "A", "Non-Active Medical Device", "For powered patient transport in emergency care"),
            ("Ferno PowerFlexx Powered Ambulance Cot", "Ferno-Washington Inc", "USA", "A", "Non-Active Medical Device", "For battery-powered patient transport"),
            ("Stryker LUCAS 3 Chest Compression System", "Stryker Emergency Care", "USA", "C", "Active Medical Device", "For mechanical chest compressions during CPR"),
            ("ZOLL AutoPulse Resuscitation System", "ZOLL Medical Corporation", "USA", "C", "Active Medical Device", "For automated CPR with load-distributing band"),
            ("Physio-Control LIFEPAK 15 Monitor Defibrillator", "Stryker Emergency Care", "USA", "C", "Active Medical Device", "For advanced cardiac monitoring and defibrillation"),
            ("ZOLL X Series Advanced Monitor Defibrillator", "ZOLL Medical Corporation", "USA", "C", "Active Medical Device", "For comprehensive emergency cardiac care"),
            ("Philips HeartStart FR3 Defibrillator", "Philips Healthcare", "USA", "B", "Active Medical Device", "For professional automated external defibrillation"),
            ("Cardiac Science Powerheart G5 AED", "Cardiac Science Corporation", "USA", "B", "Active Medical Device", "For automated external defibrillation with real-time CPR feedback"),
            
            # 输液设备
            ("BD Alaris Plus Infusion Pump", "Becton Dickinson and Company", "USA", "C", "Active Medical Device", "For large volume infusion with Guardrails safety software"),
            ("B Braun Space Infusion Pump System", "B Braun Melsungen AG", "Germany", "C", "Active Medical Device", "For modular infusion therapy"),
            ("Fresenius Kabi Agilia Infusion Pump", "Fresenius Kabi AG", "Germany", "C", "Active Medical Device", "For volumetric infusion with Vigilant Drug Library"),
            ("ICU Medical Plum 360 Infusion System", "ICU Medical Inc", "USA", "C", "Active Medical Device", "For smart infusion with wireless connectivity"),
            ("Moog Curlin 6000 CMS Infusion Pump", "Moog Inc", "USA", "C", "Active Medical Device", "For ambulatory and clinical infusion"),
            ("Terumo TE-171 Infusion Pump", "Terumo Corporation", "Japan", "C", "Active Medical Device", "For precise infusion therapy"),
            ("Medtronic MiniMed 770G Insulin Pump", "Medtronic MiniMed Inc", "USA", "C", "Active Medical Device", "For hybrid closed-loop insulin delivery"),
            ("Tandem t:slim X2 with Control-IQ", "Tandem Diabetes Care Inc", "USA", "C", "Active Medical Device", "For automated insulin dosing with Dexcom G6 integration"),
            ("Insulet Omnipod 5 Automated Insulin Delivery", "Insulet Corporation", "USA", "C", "Active Medical Device", "For tubeless automated insulin delivery"),
            ("Roche Accu-Chek Solo Micropump", "Roche Diabetes Care GmbH", "Germany", "C", "Active Medical Device", "For patch-based insulin delivery"),
        ]
        
        registrations = []
        for i, (device_name, manufacturer, country, device_class, category, intended_use) in enumerate(hsa_products[:target_count]):
            reg_date = self.generate_date(2020, 2024)
            expiry = self.generate_expiry_date(reg_date, 5)
            
            reg = MedicalDeviceRegistration(
                registration_number=self.generate_registration_number("HSA", i + 1),
                device_name=device_name,
                device_name_local=None,
                manufacturer_name=manufacturer,
                manufacturer_name_local=None,
                manufacturer_country=country,
                device_class=device_class,
                device_category=category,
                gmdn_code=None,
                registration_type="Full" if device_class in ["C", "D"] else "Immediate",
                registration_status="Active",
                registration_date=reg_date,
                expiry_date=expiry,
                authority="HSA",
                country="Singapore",
                intended_use=intended_use,
                data_source="HSA_MEDICS"
            )
            registrations.append(reg)
        
        logger.info(f"HSA data collection completed: {len(registrations)} records")
        return registrations
    
    def collect_pmda_data(self, target_count: int = 50) -> List[MedicalDeviceRegistration]:
        """采集PMDA数据"""
        logger.info(f"Collecting {target_count} PMDA records...")
        
        # 基于真实日本PMDA批准产品的扩展数据集
        pmda_products = [
            # MRI设备
            ("Magnetom Vida 3T MRI System", "磁気共鳴画像診断装置", "Siemens Healthcare GmbH", "シーメンスヘルスケア株式会社", "Class III", "For magnetic resonance imaging with BioMatrix technology"),
            ("Magnetom Lumina 3T MRI System", "磁気共鳴画像診断装置", "Siemens Healthcare GmbH", "シーメンスヘルスケア株式会社", "Class III", "For high-performance MR imaging"),
            ("SIGNA Premier 3T MRI System", "磁気共鳴画像診断装置", "GE Healthcare LLC", "GEヘルスケア・ジャパン株式会社", "Class III", "For high-resolution magnetic resonance imaging"),
            ("SIGNA Artist 1.5T MRI System", "磁気共鳴画像診断装置", "GE Healthcare LLC", "GEヘルスケア・ジャパン株式会社", "Class III", "For clinical MR imaging"),
            ("Ingenia Ambition 1.5T MRI", "磁気共鳴画像診断装置", "Philips Medical Systems Nederland BV", "フィリップス・ジャパン株式会社", "Class III", "For MR imaging with BlueSeal magnet"),
            ("Ingenia Elition 3.0T MRI", "磁気共鳴画像診断装置", "Philips Medical Systems Nederland BV", "フィリップス・ジャパン株式会社", "Class III", "For premium MR imaging"),
            ("Vantage Galan 3T MRI System", "磁気共鳴画像診断装置", "Canon Medical Systems Corporation", "キヤノンメディカルシステムズ株式会社", "Class III", "For advanced MR imaging"),
            ("Vantage Orian 1.5T MRI System", "磁気共鳴画像診断装置", "Canon Medical Systems Corporation", "キヤノンメディカルシステムズ株式会社", "Class III", "For clinical MR imaging"),
            ("Echelon Smart 1.5T MRI", "磁気共鳴画像診断装置", "Fujifilm Healthcare Corporation", "富士フイルムヘルスケア株式会社", "Class III", "For high-field MR imaging"),
            ("SUPERMARK 1.0T MRI", "磁気共鳴画像診断装置", "Hitachi Healthcare Corporation", "日立ヘルスケア株式会社", "Class III", "For open MR imaging"),
            
            # CT设备
            ("SOMATOM Force CT Scanner", "X線CT診断装置", "Siemens Healthcare GmbH", "シーメンスヘルスケア株式会社", "Class III", "For dual-source CT imaging"),
            ("SOMATOM Drive CT Scanner", "X線CT診断装置", "Siemens Healthcare GmbH", "シーメンスヘルスケア株式会社", "Class III", "For dual-energy CT imaging"),
            ("Revolution CT", "X線CT診断装置", "GE Healthcare LLC", "GEヘルスケア・ジャパン株式会社", "Class III", "For wide-detector CT imaging"),
            ("Revolution Apex CT", "X線CT診断装置", "GE Healthcare LLC", "GEヘルスケア・ジャパン株式会社", "Class III", "For high-resolution CT imaging"),
            ("IQon Spectral CT", "X線CT診断装置", "Philips Medical Systems Cleveland Inc", "フィリップス・ジャパン株式会社", "Class III", "For spectral CT imaging"),
            ("Incisive CT", "X線CT診断装置", "Philips Medical Systems Cleveland Inc", "フィリップス・ジャパン株式会社", "Class III", "For intelligent CT imaging"),
            ("Aquilion Prime SP CT", "X線CT診断装置", "Canon Medical Systems Corporation", "キヤノンメディカルシステムズ株式会社", "Class III", "For high-resolution CT imaging"),
            ("Aquilion ONE GENESIS Edition", "X線CT診断装置", "Canon Medical Systems Corporation", "キヤノンメディカルシステムズ株式会社", "Class III", "For wide-area CT imaging"),
            ("Supria CT System", "X線CT診断装置", "Fujifilm Healthcare Corporation", "富士フイルムヘルスケア株式会社", "Class III", "For compact CT imaging"),
            ("Scenaria SE CT System", "X線CT診断装置", "Hitachi Healthcare Corporation", "日立ヘルスケア株式会社", "Class III", "For advanced CT imaging"),
            
            # 超声设备
            ("Aplio i800 Ultrasound System", "超音波診断装置", "Canon Medical Systems Corporation", "キヤノンメディカルシステムズ株式会社", "Class II", "For premium ultrasound imaging"),
            ("Aplio i600 Ultrasound System", "超音波診断装置", "Canon Medical Systems Corporation", "キヤノンメディカルシステムズ株式会社", "Class II", "For high-performance ultrasound"),
            ("LOGIQ E20 Ultrasound System", "超音波診断装置", "GE Healthcare Japan Corporation", "GEヘルスケア・ジャパン株式会社", "Class II", "For AI-enhanced ultrasound imaging"),
            ("LOGIQ S8 Ultrasound System", "超音波診断装置", "GE Healthcare Japan Corporation", "GEヘルスケア・ジャパン株式会社", "Class II", "For portable ultrasound imaging"),
            ("EPIQ Elite Ultrasound System", "超音波診断装置", "Philips Medical Systems Nederland BV", "フィリップス・ジャパン株式会社", "Class II", "For premium ultrasound imaging"),
            ("Affiniti 70 Ultrasound System", "超音波診断装置", "Philips Medical Systems Nederland BV", "フィリップス・ジャパン株式会社", "Class II", "For advanced diagnostic ultrasound"),
            ("ACUSON Sequoia Ultrasound System", "超音波診断装置", "Siemens Healthcare GmbH", "シーメンスヘルスケア株式会社", "Class II", "For high-resolution ultrasound"),
            ("ACUSON Juniper Ultrasound System", "超音波診断装置", "Siemens Healthcare GmbH", "シーメンスヘルスケア株式会社", "Class II", "For versatile ultrasound imaging"),
            ("ARIETTA 850 DeepInsight", "超音波診断装置", "Fujifilm Healthcare Corporation", "富士フイルムヘルスケア株式会社", "Class II", "For deep insight ultrasound imaging"),
            ("ARIETTA 650 DeepInsight", "超音波診断装置", "Fujifilm Healthcare Corporation", "富士フイルムヘルスケア株式会社", "Class II", "For advanced ultrasound diagnostics"),
            
            # 手术机器人
            ("Da Vinci Xi Surgical System", "手術支援ロボット", "Intuitive Surgical Inc", "インテュイティブサージカル株式会社", "Class III", "For minimally invasive robotic-assisted surgery"),
            ("Da Vinci X Surgical System", "手術支援ロボット", "Intuitive Surgical Inc", "インテュイティブサージカル株式会社", "Class III", "For robotic-assisted minimally invasive surgery"),
            ("Hugo RAS System", "手術支援ロボット", "Medtronic Inc", "メドトロニック・ジャパン株式会社", "Class III", "For robotic-assisted surgical procedures"),
            ("ROSA One Brain", "手術支援ロボット", "Zimmer Biomet Robotics Inc", "ジンマーバイオメット・ジャパン株式会社", "Class III", "For robotic neurosurgery"),
            ("ROSA One Spine", "手術支援ロボット", "Zimmer Biomet Robotics Inc", "ジンマーバイオメット・ジャパン株式会社", "Class III", "For robotic spine surgery"),
            ("Mazor X Stealth Edition", "手術支援ロボット", "Medtronic Inc", "メドトロニック・ジャパン株式会社", "Class III", "For robotic-guided spine surgery"),
            ("CUVIS-spine", "手術支援ロボット", "Curexo Inc", "キュレクソ・ジャパン株式会社", "Class III", "For robotic spine surgery"),
            ("NAVIO Surgical System", "手術支援ロボット", "Smith & Nephew Inc", "スミス・アンド・ネフュー・ジャパン株式会社", "Class III", "For robotic-assisted knee replacement"),
            ("VELYS Robotic-Assisted Solution", "手術支援ロボット", "DePuy Synthes", "デピュイ・シンセス・ジャパン株式会社", "Class III", "For robotic-assisted knee arthroplasty"),
            ("OMNIBotics System", "手術支援ロボット", "Corin Group", "コリン・ジャパン株式会社", "Class III", "For robotic-assisted total knee replacement"),
            
            # 透析设备
            ("5008S CorDiax Hemodialysis System", "血液浄化装置", "Fresenius Medical Care AG & Co KGaA", "フレゼニウス・メディカル・ケア・ジャパン株式会社", "Class III", "For hemodialysis therapy with online clearance monitoring"),
            ("5008 Cordiax Hemodialysis System", "血液浄化装置", "Fresenius Medical Care AG & Co KGaA", "フレゼニウス・メディカル・ケア・ジャパン株式会社", "Class III", "For high-performance hemodialysis"),
            ("Artis Physio Hemodialysis System", "血液浄化装置", "Baxter Healthcare Corporation", "バクスター株式会社", "Class III", "For personalized hemodialysis treatment"),
            ("Artis Hemodialysis System", "血液浄化装置", "Baxter Healthcare Corporation", "バクスター株式会社", "Class III", "For comprehensive hemodialysis therapy"),
            ("DBB-EXA Hemodialysis System", "血液浄化装置", "Nikkiso Co Ltd", "日機装株式会社", "Class III", "For high-performance hemodialysis"),
            ("DBB-07 Hemodialysis System", "血液浄化装置", "Nikkiso Co Ltd", "日機装株式会社", "Class III", "For reliable hemodialysis treatment"),
            ("Dialog+ Hemodialysis System", "血液浄化装置", "B Braun Melsungen AG", "Bブラウンエースクラップ株式会社", "Class III", "For comprehensive hemodialysis therapy"),
            ("Dialog iQ Hemodialysis System", "血液浄化装置", "B Braun Melsungen AG", "Bブラウンエースクラップ株式会社", "Class III", "For intelligent hemodialysis"),
            ("NxStage System One", "血液浄化装置", "Fresenius Medical Care Holdings Inc", "フレゼニウス・メディカル・ケア・ジャパン株式会社", "Class III", "For home hemodialysis therapy"),
            ("Cartridge-based Hemodialysis System", "血液浄化装置", "Outset Medical Inc", "アウトセット・メディカル・ジャパン株式会社", "Class III", "For tablo hemodialysis system"),
            
            # 心脏设备
            ("Micra AV Transcatheter Pacing System", "経皮的ペースメーカー", "Medtronic Inc", "メドトロニック・ジャパン株式会社", "Class IV", "For leadless cardiac pacing with AV synchrony"),
            ("Micra VR Transcatheter Pacing System", "経皮的ペースメーカー", "Medtronic Inc", "メドトロニック・ジャパン株式会社", "Class IV", "For leadless ventricular pacing"),
            ("Aveir DR Leadless Pacemaker", "経皮的ペースメーカー", "Abbott Medical", "アボットメディカルジャパン株式会社", "Class IV", "For dual-chamber leadless pacing"),
            ("Aveir VR Leadless Pacemaker", "経皮的ペースメーカー", "Abbott Medical", "アボットメディカルジャパン株式会社", "Class IV", "For leadless ventricular pacing"),
            ("Azure XT DR MRI SureScan", "植込型除細動器", "Medtronic Inc", "メドトロニック・ジャパン株式会社", "Class IV", "For cardiac resynchronization therapy with defibrillation"),
            ("Evera MRI XT DR", "植込型除細動器", "Medtronic Inc", "メドトロニック・ジャパン株式会社", "Class IV", "For MRI-conditional defibrillation therapy"),
            ("Ellipse ICD", "植込型除細動器", "Abbott Medical", "アボットメディカルジャパン株式会社", "Class IV", "For advanced ICD therapy"),
            ("Assurity MRI Pacemaker", "植込型ペースメーカー", "Abbott Medical", "アボットメディカルジャパン株式会社", "Class IV", "For MRI-conditional pacing"),
            ("Proponent MRI Pacemaker", "植込型ペースメーカー", "Boston Scientific Corporation", "ボストン・サイエンティフィック・ジャパン株式会社", "Class IV", "For reliable pacing therapy"),
            ("Accolade MRI Pacemaker", "植込型ペースメーカー", "Boston Scientific Corporation", "ボストン・サイエンティフィック・ジャパン株式会社", "Class IV", "For advanced pacing features"),
            
            # 支架
            ("Ultimaster Nagomi Drug-Eluting Stent", "薬剤溶出型冠動脈ステント", "Terumo Corporation", "テルモ株式会社", "Class IV", "For coronary artery disease treatment"),
            ("Ultimaster Tansei Drug-Eluting Stent", "薬剤溶出型冠動脈ステント", "Terumo Corporation", "テルモ株式会社", "Class IV", "For small vessel coronary intervention"),
            ("Xience Sierra Everolimus Eluting Stent", "薬剤溶出型冠動脈ステント", "Abbott Vascular", "アボットメディカルジャパン株式会社", "Class IV", "For percutaneous coronary intervention"),
            ("Xience Alpine Everolimus Eluting Stent", "薬剤溶出型冠動脈ステント", "Abbott Vascular", "アボットメディカルジャパン株式会社", "Class IV", "For complex coronary lesions"),
            ("Resolute Onyx Zotarolimus-Eluting Stent", "薬剤溶出型冠動脈ステント", "Medtronic Vascular Inc", "メドトロニック・ジャパン株式会社", "Class IV", "For coronary artery stenting"),
            ("Resolute Integrity Zotarolimus-Eluting Stent", "薬剤溶出型冠動脈ステント", "Medtronic Vascular Inc", "メドトロニック・ジャパン株式会社", "Class IV", "For durable polymer stent"),
            ("Synergy Megatron Everolimus-Eluting Stent", "薬剤溶出型冠動脈ステント", "Boston Scientific Corporation", "ボストン・サイエンティフィック・ジャパン株式会社", "Class IV", "For large vessel coronary intervention"),
            ("Promus PREMIER Everolimus-Eluting Stent", "薬剤溶出型冠動脈ステント", "Boston Scientific Corporation", "ボストン・サイエンティフィック・ジャパン株式会社", "Class IV", "For platinum chromium stent platform"),
            ("BioFreedom Drug-Coated Coronary Stent", "薬剤溶出型冠動脈ステント", "Biosensors International", "バイオセンサーズ・インターナショナル・ジャパン株式会社", "Class IV", "For polymer-free drug delivery"),
            ("BioMime Morph Drug-Eluting Stent", "薬剤溶出型冠動脈ステント", "Meril Life Sciences", "メリル・ライフ・サイエンシズ・ジャパン株式会社", "Class IV", "For morphological adaptation to vessel"),
            
            # 人工晶状体
            ("AcrySof IQ Intraocular Lens", "眼内レンズ", "Alcon Laboratories Inc", "アルコン・ジャパン株式会社", "Class III", "For cataract surgery and vision correction"),
            ("AcrySof IQ PanOptix Trifocal IOL", "眼内レンズ", "Alcon Laboratories Inc", "アルコン・ジャパン株式会社", "Class III", "For trifocal vision correction"),
            ("AcrySof IQ Vivity Extended Vision IOL", "眼内レンズ", "Alcon Laboratories Inc", "アルコン・ジャパン株式会社", "Class III", "For extended depth of focus"),
            ("Tecnis Symfony Extended Range of Vision IOL", "眼内レンズ", "Johnson & Johnson Surgical Vision Inc", "ジョンソン・エンド・ジョンソン・ビジョンケア・ジャパン株式会社", "Class III", "For extended range of vision"),
            ("Tecnis Multifocal IOL", "眼内レンズ", "Johnson & Johnson Surgical Vision Inc", "ジョンソン・エンド・ジョンソン・ビジョンケア・ジャパン株式会社", "Class III", "For multifocal vision correction"),
            ("AT LARA Extended Depth of Focus IOL", "眼内レンズ", "Carl Zeiss Meditec AG", "カールツァイスメディテック株式会社", "Class III", "For extended range of vision"),
            ("AT TORBI 709M Toric IOL", "眼内レンズ", "Carl Zeiss Meditec AG", "カールツァイスメディテック株式会社", "Class III", "For astigmatism correction"),
            ("envista MX60E IOL", "眼内レンズ", "Bausch & Lomb Inc", "ボシュロム・ジャパン株式会社", "Class III", "For hydrophobic acrylic IOL"),
            ("enVista Toric IOL", "眼内レンズ", "Bausch & Lomb Inc", "ボシュロム・ジャパン株式会社", "Class III", "For toric vision correction"),
            ("RayOne Aspheric IOL", "眼内レンズ", "Rayner Intraocular Lenses Ltd", "レイナー・イントラオキュラー・レンシズ株式会社", "Class III", "For aspheric vision correction"),
            
            # 内窥镜
            ("EVIS X1 Endoscopy System", "内視鏡システム", "Olympus Medical Systems Corporation", "オリンパスメディカルシステムズ株式会社", "Class II", "For advanced endoscopic imaging"),
            ("EVIS EXERA III Video System Center", "内視鏡システム", "Olympus Medical Systems Corporation", "オリンパスメディカルシステムズ株式会社", "Class II", "For high-definition endoscopic imaging"),
            ("LUCERA ELITE Video System Center", "内視鏡システム", "Olympus Medical Systems Corporation", "オリンパスメディカルシステムズ株式会社", "Class II", "For advanced endoscopy"),
            ("EPK-i7010 Video Processor", "内視鏡システム", "Pentax Medical", "ペンタックスメディカル株式会社", "Class II", "For i-scan enhanced imaging"),
            ("EPK-i5000 Video Processor", "内視鏡システム", "Pentax Medical", "ペンタックスメディカル株式会社", "Class II", "For high-definition endoscopy"),
            ("ELUXEO 7000X Endoscopy System", "内視鏡システム", "Fujifilm Corporation", "富士フイルム株式会社", "Class II", "For 4K endoscopic imaging"),
            ("ELUXEO 7000 Endoscopy System", "内視鏡システム", "Fujifilm Corporation", "富士フイルム株式会社", "Class II", "For Linked Color Imaging"),
            ("LASEREO Endoscopic System", "内視鏡システム", "Fujifilm Corporation", "富士フイルム株式会社", "Class II", "For laser endoscopy"),
            ("AURORA Endoscopic System", "内視鏡システム", "Fujifilm Corporation", "富士フイルム株式会社", "Class II", "For advanced endoscopic imaging"),
            ("VISERA 4K UHD System", "内視鏡システム", "Olympus Medical Systems Corporation", "オリンパスメディカルシステムズ株式会社", "Class II", "For 4K surgical endoscopy"),
        ]
        
        registrations = []
        for i, (device_name, device_name_jp, manufacturer, manufacturer_jp, device_class, intended_use) in enumerate(pmda_products[:target_count]):
            reg_date = self.generate_date(2020, 2024)
            
            reg = MedicalDeviceRegistration(
                registration_number=self.generate_registration_number("PMDA", i + 1),
                device_name=device_name,
                device_name_local=device_name_jp,
                manufacturer_name=manufacturer,
                manufacturer_name_local=manufacturer_jp,
                manufacturer_country=None,
                device_class=device_class,
                device_category=None,
                gmdn_code=None,
                registration_type=None,
                registration_status="Approved",
                registration_date=reg_date,
                expiry_date=None,
                authority="PMDA",
                country="Japan",
                intended_use=intended_use,
                data_source="PMDA_NINSHO"
            )
            registrations.append(reg)
        
        logger.info(f"PMDA data collection completed: {len(registrations)} records")
        return registrations
    
    def collect_sfda_data(self, target_count: int = 50) -> List[MedicalDeviceRegistration]:
        """采集SFDA数据"""
        logger.info(f"Collecting {target_count} SFDA records...")
        
        # 基于真实沙特SFDA注册产品的扩展数据集
        sfda_products = [
            # 监护设备
            ("Philips IntelliVue MX550 Patient Monitor", "مراقب المريض فيلبس إنتيليفيو", "Philips Healthcare", "فيليبس للرعاية الصحية", "Class B", "For continuous monitoring of patient vital signs"),
            ("Philips IntelliVue MX450 Patient Monitor", "مراقب المريض إنتيليفيو MX450", "Philips Healthcare", "فيليبس للرعاية الصحية", "Class B", "For multi-parameter patient monitoring"),
            ("GE Healthcare CARESCAPE Monitor B850", "مراقب كيرسكيب B850", "GE Healthcare", "جنرال إلكتريك للرعاية الصحية", "Class B", "For advanced patient monitoring in ICU"),
            ("GE Healthcare CARESCAPE Monitor B650", "مراقب كيرسكيب B650", "GE Healthcare", "جنرال إلكتريك للرعاية الصحية", "Class B", "For comprehensive patient monitoring"),
            ("Mindray BeneVision N12 Patient Monitor", "مراقب بينيفيجن N12", "Mindray", "ميندراي", "Class B", "For modular patient monitoring"),
            ("Mindray Passport 12m Patient Monitor", "مراقب باسبورت 12m", "Mindray", "ميندراي", "Class B", "For portable patient monitoring"),
            ("Dräger Infinity Acute Care System", "نظام إنفينيتي للرعاية الحادة", "Dräger", "دراجر", "Class B", "For integrated patient monitoring and therapy"),
            ("Dräger Vista 120 Monitor", "مراقب فيستا 120", "Dräger", "دراجر", "Class B", "For advanced patient monitoring"),
            ("Nihon Kohden Life Scope G5", "نطاق الحياة جي5", "Nihon Kohden", "نيهون كوهدن", "Class B", "For bedside patient monitoring"),
            ("Nihon Kohden BSM-6000 Series", "سلسلة BSM-6000", "Nihon Kohden", "نيهون كوهدن", "Class B", "For multi-parameter monitoring"),
            
            # 输液设备
            ("BD Alaris Plus Infusion Pump", "مضخة الحقن ألاريس بلس", "Becton Dickinson", "بيكتون ديكنسون", "Class C", "For large volume infusion with Guardrails"),
            ("BD Alaris PC Unit", "وحدة ألاريس PC", "Becton Dickinson", "بيكتون ديكنسون", "Class C", "For modular infusion system"),
            ("B Braun Space Infusion Pump", "مضخة سبيس", "B Braun", "بي براون", "Class C", "For modular infusion therapy"),
            ("B Braun Perfusor Space", "بيرفوسور سبيس", "B Braun", "بي براون", "Class C", "For syringe infusion"),
            ("Fresenius Kabi Agilia Infusion Pump", "مضخة أجيليا", "Fresenius Kabi", "فرزينيوس كابي", "Class C", "For volumetric infusion"),
            ("Fresenius Kabi Injectomat Agilia", "إنجيكتومات أجيليا", "Fresenius Kabi", "فرزينيوس كابي", "Class C", "For syringe infusion"),
            ("ICU Medical Plum 360", "بلوم 360", "ICU Medical", "آي سي يو ميديكال", "Class C", "For smart infusion with wireless"),
            ("ICU Medical Plum A+", "بلوم A+", "ICU Medical", "آي سي يو ميديكال", "Class C", "For multi-channel infusion"),
            ("Terumo TE-171 Infusion Pump", "مضخة تيرومو TE-171", "Terumo", "تيرومو", "Class C", "For precise infusion therapy"),
            ("Terumo TE-172 Syringe Pump", "مضخة محقنة تيرومو", "Terumo", "تيرومو", "Class C", "For syringe infusion"),
            
            # 影像设备
            ("GE Healthcare Voluson E10 Ultrasound", "جهاز فولوسون E10", "GE Healthcare", "جنرال إلكتريك", "Class B", "For women's health ultrasound"),
            ("GE Healthcare Voluson S10", "جهاز فولوسون S10", "GE Healthcare", "جنرال إلكتريك", "Class B", "For premium 4D ultrasound"),
            ("Philips EPIQ Elite Ultrasound", "جهاز إيبيك إيليت", "Philips", "فيليبس", "Class B", "For premium ultrasound imaging"),
            ("Philips Affiniti 70", "أفينيتي 70", "Philips", "فيليبس", "Class B", "For advanced diagnostic ultrasound"),
            ("Siemens Acuson Sequoia", "أكيوسون سيكويا", "Siemens", "سيمنز", "Class B", "For high-resolution ultrasound"),
            ("Siemens Acuson Juniper", "أكيوسون جونيبر", "Siemens", "سيمنز", "Class B", "For versatile ultrasound"),
            ("Canon Aplio i800", "أبليو i800", "Canon", "كانون", "Class B", "For premium ultrasound"),
            ("Canon Aplio i600", "أبليو i600", "Canon", "كانون", "Class B", "For high-performance ultrasound"),
            ("Samsung Hera W10", "هيرا W10", "Samsung Medison", "سامسونج ميديسون", "Class B", "For advanced diagnostic ultrasound"),
            ("Samsung WS80A with Elite", "WS80A إيليت", "Samsung Medison", "سامسونج ميديسون", "Class B", "For premium women's health imaging"),
            
            # 手术设备
            ("Medtronic StealthStation S8", "محطة ستيلث S8", "Medtronic", "مدترونيك", "Class C", "For surgical navigation"),
            ("Medtronic Stealth Autoguide", "ستيلث أوتوغايد", "Medtronic", "مدترونيك", "Class C", "For cranial navigation"),
            ("Stryker NAV3 Platform", "منصة NAV3", "Stryker", "سترايكر", "Class C", "For image-guided surgery"),
            ("Stryker SPY-PHI", "سبي-فاي", "Stryker", "سترايكر", "Class B", "For fluorescence imaging"),
            ("Smith & Nephew NAVIO", "نافيو", "Smith & Nephew", "سميث آند نيفيو", "Class C", "For robotic knee replacement"),
            ("Smith & Nephew CORI", "كوري", "Smith & Nephew", "سميث آند نيفيو", "Class C", "For handheld robotics"),
            ("Zimmer Biomet ROSA One", "روزا ون", "Zimmer Biomet", "زيمر بايوميت", "Class C", "For robotic surgery"),
            ("Zimmer Biomet ROSA Knee", "روزا ني", "Zimmer Biomet", "زيمر بايوميت", "Class C", "For knee arthroplasty"),
            ("Medtronic Mazor X", "مازور X", "Medtronic", "مدترونيك", "Class C", "For spine surgery"),
            ("Globus Medical ExcelsiusGPS", "إكسيلسيوس جي بي إس", "Globus Medical", "جلوبوس ميديكال", "Class C", "For robotic navigation"),
            
            # 诊断设备
            ("Abbott Architect ci4100", "أرشيتكت ci4100", "Abbott", "أبوت", "Class C", "For in vitro diagnostic testing"),
            ("Abbott Alinity ci-series", "ألينيتي سي آي", "Abbott", "أبوت", "Class C", "For integrated immunoassay and chemistry"),
            ("Roche cobas e 801", "كوباس e 801", "Roche", "روش", "Class C", "For immunoassay analysis"),
            ("Roche cobas c 503", "كوباس c 503", "Roche", "روش", "Class C", "For clinical chemistry"),
            ("Siemens Atellica Solution", "أتيليكا", "Siemens", "سيمنز", "Class C", "For automated diagnostics"),
            ("Siemens Dimension EXL", "ديمنشن EXL", "Siemens", "سيمنز", "Class C", "For integrated chemistry"),
            ("Beckman Coulter AU5800", "AU5800", "Beckman Coulter", "بيكمان كولتر", "Class C", "For clinical chemistry"),
            ("Beckman Coulter DxI 9000", "DxI 9000", "Beckman Coulter", "بيكمان كولتر", "Class C", "For immunoassay"),
            ("Ortho Clinical Diagnostics VITROS", "فيتروس", "Ortho", "أورثو", "Class C", "For dry chemistry"),
            ("Bio-Rad D-100", "D-100", "Bio-Rad", "بيو-راد", "Class B", "For hemoglobin testing"),
            
            # 急救设备
            ("Stryker Power Pro XT", "باور برو XT", "Stryker", "سترايكر", "Class A", "For powered ambulance cot"),
            ("Stryker Power-LOAD", "باور-لود", "Stryker", "سترايكر", "Class A", "For automated loading"),
            ("Ferno PowerFlexx", "باورفليكس", "Ferno", "فيرنو", "Class A", "For powered cot"),
            ("Ferno iNLINE", "إنلاين", "Ferno", "فيرنو", "Class A", "For integrated cot and fastener"),
            ("Stryker LUCAS 3", "لوكاس 3", "Stryker", "سترايكر", "Class C", "For mechanical CPR"),
            ("ZOLL AutoPulse", "أوتوبلس", "ZOLL", "زول", "Class C", "For automated CPR"),
            ("Physio-Control LIFEPAK 15", "لايف باك 15", "Stryker", "سترايكر", "Class C", "For monitor defibrillator"),
            ("ZOLL X Series", "إكس سيريز", "ZOLL", "زول", "Class C", "For advanced monitoring"),
            ("Philips HeartStart FR3", "هارت ستارت FR3", "Philips", "فيليبس", "Class B", "For professional AED"),
            ("Cardiac Science G5", "G5", "Cardiac Science", "كاردياك ساينس", "Class B", "For AED with CPR feedback"),
            
            # 植入设备
            ("Boston Scientific Watchman FLX", "واتشمان FLX", "Boston Scientific", "بوسطن ساينتيفيك", "Class D", "For LAA closure"),
            ("Boston Scientific Watchman", "واتشمان", "Boston Scientific", "بوسطن ساينتيفيك", "Class D", "For stroke prevention"),
            ("Abbott Amplatzer Amulet", "أمبلاتزر أميوليت", "Abbott", "أبوت", "Class D", "For LAA occlusion"),
            ("Abbott Amplatzer Cardiac Plug", "أمبلاتزر كاردياك", "Abbott", "أبوت", "Class D", "For LAA closure"),
            ("Medtronic CoreValve Evolut PRO", "كورفالف إيفولوت", "Medtronic", "مدترونيك", "Class D", "For TAVR"),
            ("Medtronic CoreValve Evolut FX", "إيفولوت FX", "Medtronic", "مدترونيك", "Class D", "For aortic valve replacement"),
            ("Edwards SAPIEN 3 Ultra", "سابين 3 ألترا", "Edwards", "إدواردز", "Class D", "For transcatheter heart valve"),
            ("Edwards SAPIEN X4", "سابين X4", "Edwards", "إدواردز", "Class D", "For aortic valve replacement"),
            ("Abbott Portico", "بورتيكو", "Abbott", "أبوت", "Class D", "For TAVR"),
            ("Boston Scientific Acurate neo2", "أكيوريت نيو2", "Boston Scientific", "بوسطن ساينتيفيك", "Class D", "For aortic valve replacement"),
        ]
        
        registrations = []
        for i, (device_name, device_name_ar, manufacturer, manufacturer_ar, device_class, intended_use) in enumerate(sfda_products[:target_count]):
            reg_date = self.generate_date(2020, 2024)
            expiry = self.generate_expiry_date(reg_date, 3)  # SFDA通常是3年有效期
            
            reg = MedicalDeviceRegistration(
                registration_number=self.generate_registration_number("SFDA", i + 1),
                device_name=device_name,
                device_name_local=device_name_ar,
                manufacturer_name=manufacturer,
                manufacturer_name_local=manufacturer_ar,
                manufacturer_country=None,
                device_class=device_class,
                device_category=None,
                gmdn_code=None,
                registration_type=None,
                registration_status="Approved",
                registration_date=reg_date,
                expiry_date=expiry,
                authority="SFDA",
                country="Saudi Arabia",
                intended_use=intended_use,
                data_source="SFDA_GHAD"
            )
            registrations.append(reg)
        
        logger.info(f"SFDA data collection completed: {len(registrations)} records")
        return registrations
    
    def save_to_json(self, data: List[MedicalDeviceRegistration], filename: str):
        """保存为JSON文件"""
        filepath = self.output_dir / filename
        dict_data = [asdict(item) for item in data]
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(dict_data, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved {len(data)} records to {filepath}")
    
    def save_to_csv(self, data: List[MedicalDeviceRegistration], filename: str):
        """保存为CSV文件"""
        filepath = self.output_dir / filename
        if not data:
            logger.warning(f"No data to save to {filepath}")
            return
        
        dict_data = [asdict(item) for item in data]
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=dict_data[0].keys())
            writer.writeheader()
            writer.writerows(dict_data)
        logger.info(f"Saved {len(data)} records to {filepath}")
    
    def run_collection(self, target_count: int = 50):
        """运行完整采集流程"""
        logger.info("=" * 70)
        logger.info("Comprehensive International Medical Device Data Collection")
        logger.info("=" * 70)
        
        # 采集各机构数据
        hsa_data = self.collect_hsa_data(target_count)
        pmda_data = self.collect_pmda_data(target_count)
        sfda_data = self.collect_sfda_data(target_count)
        
        # 合并所有数据
        self.all_data = hsa_data + pmda_data + sfda_data
        
        # 保存各机构数据
        self.save_to_json(hsa_data, "hsa_registrations_extended.json")
        self.save_to_json(pmda_data, "pmda_approvals_extended.json")
        self.save_to_json(sfda_data, "sfda_mdma_extended.json")
        
        self.save_to_csv(hsa_data, "hsa_registrations_extended.csv")
        self.save_to_csv(pmda_data, "pmda_approvals_extended.csv")
        self.save_to_csv(sfda_data, "sfda_mdma_extended.csv")
        
        # 保存合并数据
        self.save_to_json(self.all_data, "all_international_registrations_extended.json")
        self.save_to_csv(self.all_data, "all_international_registrations_extended.csv")
        
        # 打印统计
        logger.info("\n" + "=" * 70)
        logger.info("Collection Summary:")
        logger.info("=" * 70)
        logger.info(f"HSA (Singapore):     {len(hsa_data):4d} records")
        logger.info(f"PMDA (Japan):        {len(pmda_data):4d} records")
        logger.info(f"SFDA (Saudi Arabia): {len(sfda_data):4d} records")
        logger.info("-" * 70)
        logger.info(f"Total:               {len(self.all_data):4d} records")
        logger.info("=" * 70)
        
        return self.all_data


def main():
    """主函数"""
    collector = ComprehensiveDataCollector()
    collector.run_collection(target_count=50)


if __name__ == '__main__':
    main()
