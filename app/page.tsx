import { redirect } from 'next/navigation';
import { defaultLocale } from './i18n-config'; // 指向app内的配置文件

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
