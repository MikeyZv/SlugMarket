"use client";

import { useState } from "react";

type ProductImageGalleryProps = {
    images: string[];
    title: string;
};

export default function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const currentImage = images[currentIndex]

    function goPrevious() {
        setCurrentIndex((prev) => 
            prev === 0 ? images.length - 1 : prev - 1
        )
    }

    function goNext() {
        setCurrentIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        )
    }

    return (
        <div className="w-full">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                    src={currentImage}
                    alt={title}
                    className="w-full aspect-square object-cover"
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={goPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 shadow flex items-center justify-center text-2xl"
                        >
                            ◀
                        </button>

                        <button
                            onClick={goNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 shadow flex items-center justify-center text-2xl"
                        >
                            ▶
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <p>
                    {currentIndex + 1} / {images.length}
                </p>
            )}
        </div>
    )
}