'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// 注册中文字体
Font.register({
  family: 'NotoSansSC',
  src: 'https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS5CHYo3zVmQ-HdyVqSy5hM3kJ9A.119.woff2',
});

// 颜色系统
const COLORS = {
  primary: '#339999',
  primaryDark: '#2a7a7a',
  primaryLight: '#E6F5F5',
  text: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E5E5E5',
  white: '#FFFFFF',
};

// 样式定义
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: COLORS.text,
    lineHeight: 1.6,
  },
  // 页眉样式
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerText: {
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  // 内容样式
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  metaInfo: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 5,
  },
  metaItem: {
    marginRight: 20,
  },
  metaLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  text: {
    fontSize: 11,
    marginBottom: 5,
  },
  // 表格样式
  table: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHeader: {
    backgroundColor: COLORS.primaryLight,
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
  },
  tableCellHeader: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // 步骤样式
  step: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  stepContent: {
    fontSize: 10,
    color: COLORS.text,
  },
  // 页脚样式
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
  },
  footerText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 3,
  },
  footerDisclaimer: {
    fontSize: 8,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
  pageNumber: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 5,
  },
  // 封面页样式
  coverPage: {
    padding: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverLogo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  coverMeta: {
    width: '100%',
    marginTop: 40,
    padding: 20,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
  },
  coverMetaItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  coverMetaLabel: {
    width: 120,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  coverMetaValue: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  coverWebsite: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: COLORS.primary,
  },
});

// 生成报告编号
export function generateReportId(type: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MDL-${type}-${year}${month}${day}-${random}`;
}

// 格式化日期
function formatDate(date: Date, locale: string): string {
  if (locale === 'zh') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 封面页组件
function CoverPage({
  title,
  subtitle,
  reportId,
  generatedAt,
  locale,
}: {
  title: string;
  subtitle: string;
  reportId: string;
  generatedAt: Date;
  locale: string;
}) {
  return (
    <Page size="A4" style={styles.coverPage}>
      <Image src="/logo.png" style={styles.coverLogo} />
      <Text style={styles.coverTitle}>MDLooker Platform</Text>
      <Text style={styles.coverSubtitle}>
        {locale === 'zh'
          ? '全球医疗器械合规情报平台'
          : 'Global Medical Device Compliance Intelligence Platform'}
      </Text>
      <View style={{ height: 40 }} />
      <Text style={[styles.title, { textAlign: 'center' }]}>{title}</Text>
      <Text style={[styles.subtitle, { textAlign: 'center' }]}>{subtitle}</Text>
      <View style={styles.coverMeta}>
        <View style={styles.coverMetaItem}>
          <Text style={styles.coverMetaLabel}>
            {locale === 'zh' ? '报告编号:' : 'Report ID:'}
          </Text>
          <Text style={styles.coverMetaValue}>{reportId}</Text>
        </View>
        <View style={styles.coverMetaItem}>
          <Text style={styles.coverMetaLabel}>
            {locale === 'zh' ? '生成日期:' : 'Generated:'}
          </Text>
          <Text style={styles.coverMetaValue}>{formatDate(generatedAt, locale)}</Text>
        </View>
      </View>
      <Text style={styles.coverWebsite}>www.mdlooker.com</Text>
    </Page>
  );
}

// 页眉组件
function Header({ locale }: { locale: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image src="/logo.png" style={styles.logo} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>MDLooker Platform</Text>
          <Text style={styles.headerSubtitle}>
            {locale === 'zh'
              ? '全球医疗器械合规情报平台'
              : 'Global Medical Device Compliance Intelligence Platform'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// 页脚组件
function Footer({
  pageNumber,
  totalPages,
  locale,
}: {
  pageNumber: number;
  totalPages: number;
  locale: string;
}) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        © 2026 MDLooker Platform. All Rights Reserved. | www.mdlooker.com | support@mdlooker.com
      </Text>
      <Text style={styles.footerDisclaimer}>
        {locale === 'zh'
          ? '免责声明: 本报告仅供参考，具体法规要求请以目标市场官方机构最新发布为准。'
          : 'Disclaimer: This report is for reference only. Please refer to the official regulatory authorities for the most current requirements.'}
      </Text>
      <Text style={styles.pageNumber}>
        {locale === 'zh' ? `第 ${pageNumber} 页 / 共 ${totalPages} 页` : `Page ${pageNumber} of ${totalPages}`}
      </Text>
    </View>
  );
}

// Market Access Pathway Report PDF
export function MarketAccessPDF({
  pathway,
  productCategory,
  sourceCountry,
  targetMarket,
  deviceClass,
  locale,
}: {
  pathway: any;
  productCategory: string;
  sourceCountry: string;
  targetMarket: string;
  deviceClass: string;
  locale: string;
}) {
  const reportId = generateReportId('MAP');
  const generatedAt = new Date();
  const hasCoverPage = pathway.requirements.length > 3;

  const title = locale === 'zh' ? '市场准入路径报告' : 'Market Access Pathway Report';
  const subtitle = locale === 'zh' ? `目标市场: ${targetMarket}` : `Target Market: ${targetMarket}`;

  return (
    <Document>
      {hasCoverPage && (
        <CoverPage
          title={title}
          subtitle={subtitle}
          reportId={reportId}
          generatedAt={generatedAt}
          locale={locale}
        />
      )}
      <Page size="A4" style={styles.page}>
        <Header locale={locale} />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{locale === 'zh' ? '报告编号' : 'Report ID'}</Text>
              <Text style={styles.metaValue}>{reportId}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{locale === 'zh' ? '生成日期' : 'Generated'}</Text>
              <Text style={styles.metaValue}>{formatDate(generatedAt, locale)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {locale === 'zh' ? '产品信息' : 'Product Information'}
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellHeader}>
                    {locale === 'zh' ? '项目' : 'Item'}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellHeader}>
                    {locale === 'zh' ? '内容' : 'Content'}
                  </Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>{locale === 'zh' ? '产品类别' : 'Category'}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>{productCategory}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>{locale === 'zh' ? '来源国' : 'Source Country'}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>{sourceCountry}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>{locale === 'zh' ? '目标市场' : 'Target Market'}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>{targetMarket}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>{locale === 'zh' ? '设备分类' : 'Device Class'}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>{deviceClass}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {locale === 'zh' ? '准入路径步骤' : 'Access Pathway Steps'}
            </Text>
            {pathway.requirements.map((req: any, index: number) => (
              <View key={index} style={styles.step}>
                <Text style={styles.stepTitle}>
                  {locale === 'zh' ? `步骤 ${req.step}: ${req.titleZh}` : `Step ${req.step}: ${req.title}`}
                </Text>
                <Text style={styles.stepContent}>
                  {locale === 'zh' ? req.descriptionZh : req.description}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {locale === 'zh' ? '核心法规' : 'Key Regulations'}
            </Text>
            {(locale === 'zh' ? pathway.keyRegulationsZh : pathway.keyRegulations).map(
              (reg: string, idx: number) => (
                <Text key={idx} style={styles.text}>
                  {idx + 1}. {reg}
                </Text>
              )
            )}
          </View>
        </View>
        <Footer pageNumber={1} totalPages={1} locale={locale} />
      </Page>
    </Document>
  );
}

// 通用 PDF 导出函数
export async function generateAndDownloadPDF(
  pdfComponent: React.ReactElement,
  filename: string
) {
  const { pdf } = await import('@react-pdf/renderer');
  const blob = await pdf(pdfComponent).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
