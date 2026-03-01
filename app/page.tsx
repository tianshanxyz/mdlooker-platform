import { redirect } from 'next/navigation';

// 默认重定向到英文页面
export default function RootPage() {
  redirect('/en');
}
