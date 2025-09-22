// === components/GalleryModal.tsx ===
import { XMarkIcon } from "@heroicons/react/24/solid";
import { GalleryItem } from "@/types/gallery";


export default function GalleryModal({
project,
onClose,
}: {
project: GalleryItem;
onClose: () => void;
}) {
return (
<div className="fixed inset-0 z-30 flex items-center justify-center px-4 pointer-events-none">
<div className="bg-white rounded-xl max-w-5xl w-full p-6 relative overflow-y-auto max-h-[90vh] shadow-xl pointer-events-auto">
<button
className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
onClick={onClose}
>
<XMarkIcon className="w-6 h-6" />
</button>


<h3 className="text-xl font-bold mb-2">{project.title}</h3>
<p className="text-sm text-gray-500 mb-1">
{project.resolution} · {project.duration}
</p>


<p className="text-gray-700 text-sm mb-4">{project.description}</p>


<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<h4 className="font-semibold mb-1">Script</h4>
<p className="text-sm whitespace-pre-wrap">{project.script}</p>


<h4 className="font-semibold mt-4 mb-1">Tags</h4>
<div className="flex flex-wrap gap-2 text-xs text-blue-600">
{project.tags.map((tag) => (
<span key={tag}>#{tag}</span>
))}
</div>
</div>


<div>
<video
src={project.video}
controls
className="w-full rounded-lg shadow"
/>
</div>
</div>
</div>
</div>
);
}