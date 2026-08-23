"use client";
import { useState } from "react";

export default function ImageCompress() {
  const [orig, setOrig] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [stats, setStats] = useState<string>("");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setOrig(url);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 800 / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const out = canvas.toDataURL("image/jpeg", 0.6);
      setCompressed(out);
      setStats(`Original: ${(f.size / 1024).toFixed(1)}KB → Compressed: ${(out.length * 0.75 / 1024).toFixed(1)}KB (60% quality, ${canvas.width}×${canvas.height})`);
    };
    img.src = url;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black">Image Compress — Free, Browser Only</h1>
      <p className="text-sm text-zinc-500">No upload to server. Canvas compression, privacy safe. SEO: compress image online</p>
      <label className="mt-4 block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer bg-zinc-50 dark:bg-zinc-900">
        Click to choose image (JPG/PNG)
        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
      </label>
      {stats && <p className="text-sm text-emerald-600 mt-3">{stats}</p>}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {orig && <div><p className="text-sm font-medium">Original</p><img src={orig} alt="orig" className="mt-2 rounded border max-h-80 object-contain" /></div>}
        {compressed && <div><p className="text-sm font-medium">Compressed (60%)</p><img src={compressed} alt="comp" className="mt-2 rounded border max-h-80 object-contain" /><a href={compressed} download="compressed.jpg" className="mt-2 inline-block bg-emerald-500 text-white px-4 py-2 rounded-full text-sm">Download</a></div>}
      </div>
      <div className="mt-6 text-xs text-zinc-500">
        Ad slot — AdSense here. Next: <a href="/tools/json-formatter" className="underline">JSON Formatter</a> • <a href="/" className="underline">Refund Hunter</a>
      </div>
    </div>
  );
}
