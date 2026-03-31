const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: 'POST', body: form }
  );
  if (!res.ok) throw new Error('Upload falhou');
  const data = await res.json();
  return data.secure_url as string;
}
