// === components/GalleryGrid.tsx ===
"use client";


import { useEffect, useState } from "react";
import Image from "next/image";
import { GalleryItem } from "@/types/gallery";
import GalleryModal from "./GalleryModal";


export default function GalleryGrid() {
const [items, setItems] = useState<GalleryItem[]>([]);
const [selected, setSelected] = useState<GalleryItem | null>(null);


useEffect(() => {
fetch("/data/gallery.json")
.then((res) => res.json())
.then(setItems);
}, []);


return (
<>
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
{items.map((item) => (
<div
key={item.id}
className="border border-gray-200 rounded-md overflow-hidden shadow bg-white cursor-pointer hover:shadow-lg transition-transform hover:scale-[1.02] scale-90"
onClick={() => setSelected(item)}
>
<div className="relative w-full aspect-[1/1]">
<Image
src={item.thumbnail}
alt={item.title}
fill
className="object-cover"
/>
</div>
<div className="p-2 flex-1 min-w-0">
<p className="font-semibold text-sm truncate ">{item.title}</p>
</div>
</div>
))}
</div>


{selected && <GalleryModal project={selected} onClose={() => setSelected(null)} />}
</>
);
}