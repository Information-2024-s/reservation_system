import React from 'react';

const CreditsPage = () => {
  const libraries = [
    {
      name: 'Next.js',
      author: 'Vercel',
      license: 'MIT',
      url: 'https://nextjs.org/',
      description: 'React ベースのフルスタック Web フレームワーク'
    },
    {
      name: 'Hono',
      author: 'Yusuke Wada',
      license: 'MIT',
      url: 'https://hono.dev/',
      description: '軽量で高速な Web フレームワーク'
    },
    {
      name: 'Zod',
      author: 'Colin McDonnell',
      license: 'MIT',
      url: 'https://zod.dev/',
      description: 'TypeScript ファーストなスキーマバリデーション'
    },
    {
      name: 'Prisma',
      author: 'Prisma Team',
      license: 'Apache 2.0',
      url: 'https://www.prisma.io/',
      description: '次世代の TypeScript ORM'
    },
    {
      name: 'NextAuth.js',
      author: 'Iain Collins',
      license: 'ISC',
      url: 'https://next-auth.js.org/',
      description: 'Next.js 用の認証ライブラリ'
    },
    {
      name: 'React',
      author: 'Facebook Inc.',
      license: 'MIT',
      url: 'https://reactjs.org/',
      description: 'ユーザーインターフェース構築ライブラリ'
    },
    {
      name: 'LINE LIFF SDK',
      author: 'LINE Corporation',
      license: 'Apache 2.0',
      url: 'https://developers.line.biz/ja/docs/liff/',
      description: 'LINE アプリ内ウェブアプリ開発用 SDK'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">ライブラリクレジット</h1>
      
      <div className="mb-8 text-center text-gray-600">
        <p>このプロジェクトは以下の素晴らしいオープンソースライブラリを使用しています。</p>
        <p>開発者・コントリビューターの皆様に感謝いたします。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {libraries.map((lib, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-2 text-blue-600">
              <a 
                href={lib.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {lib.name}
              </a>
            </h3>
            <p className="text-sm text-gray-600 mb-2">作者: {lib.author}</p>
            <p className="text-sm text-gray-600 mb-3">ライセンス: {lib.license}</p>
            <p className="text-sm text-gray-700">{lib.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>オープンソースコミュニティの継続的な貢献と革新に敬意を表します。</p>
        <p className="mt-2">最終更新: 2025年10月</p>
      </div>
    </div>
  );
};

export default CreditsPage;