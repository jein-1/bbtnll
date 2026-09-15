export const metadata = {
  title: 'Tentang TNLL',
}

export default function TentangPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 text-center">
          Tentang Taman Nasional Lore Lindu
        </h1>
        
        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl mb-12 flex items-center justify-center overflow-hidden relative">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542224566-6e85f2e10715?q=80&w=2000')] bg-cover bg-center opacity-50" />
           <div className="relative z-10 text-white text-2xl font-bold bg-black/40 px-6 py-3 rounded-lg backdrop-blur-sm">
             Video Profil TNLL
           </div>
        </div>

        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
          <p className="lead text-xl text-slate-600 dark:text-slate-300 font-medium mb-8 text-justify">
            Taman Nasional Lore Lindu (TNLL) terletak di provinsi Sulawesi Tengah dan merupakan salah satu kawasan perlindungan alam terbesar di pulau Sulawesi. Kawasan ini ditetapkan sebagai Cagar Biosfer oleh UNESCO pada tahun 1977.
          </p>
          
          <h2 className="text-2xl font-bold mt-10 mb-4">Sejarah dan Pembentukan</h2>
          <p className="text-justify mb-6 text-slate-600 dark:text-slate-400">
            Kawasan ini secara resmi dideklarasikan sebagai Taman Nasional meliputi area seluas sekitar 217.991,18 hektar. TNLL dibentuk melalui penggabungan beberapa kawasan suaka alam yang sudah ada sebelumnya, yakni Suaka Margasatwa Lore Kalamanta, Hutan Wisata/Hutan Lindung Danau Lindu, dan Suaka Margasatwa Sopu Gumbasa.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Keanekaragaman Hayati</h2>
          <p className="text-justify mb-6 text-slate-600 dark:text-slate-400">
            Taman Nasional ini melindungi ekosistem hutan pegunungan yang sangat penting bagi keanekaragaman hayati Sulawesi. Lebih dari 50% jenis burung endemik Sulawesi dapat ditemukan di sini, termasuk burung Maleo yang langka. Selain itu, kawasan ini juga merupakan habitat bagi mamalia endemik seperti Anoa, Babi Rusa, dan Tarsius.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Peninggalan Megalitik</h2>
          <p className="text-justify mb-6 text-slate-600 dark:text-slate-400">
            Selain kekayaan alamnya, TNLL juga terkenal di seluruh dunia karena peninggalan budaya prasejarahnya. Terdapat lebih dari 400 batu megalitik prasejarah yang tersebar di Lembah Bada, Lembah Besoa, dan Lembah Napu, menjadikannya salah satu monumen megalitik terbaik di Indonesia.
          </p>
        </div>
      </div>
    </div>
  )
}
