import React, { useState } from 'react';
import Button from './Button';


interface ImageDisplayProps {
    image: File;
    onImageSubmit: (image: File) => void;
}

interface ImageWithTag {
    image: File;
    tags: string[];
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ image, onImageSubmit }) => {
    const [imagesWithTag, setImagesWithTag] = useState<ImageWithTag[]>([]);
    const [newTag, setNewTag] = useState<string>('');

    const handleAddTag = (image: File) => {
        const trimmedNewTag = newTag.trim();
        const existingImageWithTag = imagesWithTag.find((img) => img.image === image);
        if (existingImageWithTag) {
            existingImageWithTag.tags.push(`#${trimmedNewTag}`);
            setImagesWithTag([...imagesWithTag]);
        } else {
            setImagesWithTag([...imagesWithTag, { image, tags: [`#${trimmedNewTag}`] }]);
        }
        setNewTag('');
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTag(e.target.value);
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('files', image);
        const tags = imagesWithTag.find((img) => img.image === image)?.tags || [];
        formData.append('tags', JSON.stringify(tags));

        try {
            setImagesWithTag((prevImages) => prevImages.filter((img) => img.image !== image));
            onImageSubmit(image)
            const response = await fetch('/api/uploadthing/fileUpload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log(data);

        } catch (error) {
            console.error(error);
        }
    };


    const imageWithTag = imagesWithTag.find((img) => img.image === image);
    const tags = imageWithTag ? imageWithTag.tags : [];

    return (
        <div
            className="bg-main w-[66vw] h-[85vh] flex flex-col items-center"
        >
            <div
                className="w-[100%] h-[85%] flex center justify-center items-center"
            >
                <img
                    src={URL.createObjectURL(image)}
                    alt={image.name}
                    className="max-w-[100%] max-h-[100%] object-contain"
                />
            </div>

            <div
                className="bg-light-main w-[100%] h-[15%] flex center flex-col justify-center items-center p-2.5"
            >
                <div
                    className="bg-light w-[100%] rounded-lg h-[30%] flex center flex-row justify-center items-center"
                >
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-secondary p-1 h-[80%] rounded-lg mr-2.5"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <div
                    className="w-[100%] h-[30%]  flex center"
                >
                    <input
                        type="text"
                        value={newTag}
                        onChange={handleTagChange}
                        className="w-full h-[100%] p-2.5 text-lg border-none rounded-lg shadow-md"
                    />
                    <Button
                        onClick={() => handleAddTag(image)}
                        disabled={!newTag.trim()}
                    >
                        Dodaj tag
                    </Button>
                </div>
                <div
                    className="w-[100%] h-[30%]  flex justify-end"
                >
                    <Button style={{ alignSelf: 'flex-end' }} onClick={handleSubmit}>
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImageDisplay;