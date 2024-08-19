import Image from 'next/image';

interface ImageDisplayProps {
    image: File;
}

const ImageDisplay = ({ image }: ImageDisplayProps) => {
    return (
        <div className="flex justify-center">
            <Image src={URL.createObjectURL(image)} alt={image.name} width={400} height={400} />
        </div>
    );
};

export default ImageDisplay;