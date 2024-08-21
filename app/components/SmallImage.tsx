import React, { useState } from 'react';

interface Props {
    image: {
        url: string,
        tags: Array<string>,
        upvotes: Number,
        downvotes: Number,
        createdAt: Date,
        updatedAt: Date,
        Locked: Boolean,
        Name: string,
        Size: Number,
        Type: string,
        _id: string
    };
}

const SmallImage: React.FC<Props> = ({ image }) => {
    const [imageUrl, setImageUrl] = useState(image.url);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageError = () => {
        setImageUrl('https://media.istockphoto.com/id/1472933890/vector/no-image-vector-symbol-missing-available-icon-no-gallery-for-this-moment-placeholder.jpg?s=612x612&w=0&k=20&c=Rdn-lecwAj8ciQEccm0Ep2RX50FCuUJOaEM8qQjiLL0=');
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <div
            className="relative overflow-hidden"
            style={{
                maxHeight: 'calc(100vw / 2)',
            }}
        >
            <img
                src={imageUrl}
                onError={handleImageError}
                onLoad={handleImageLoad}
                className="w-full object-cover"
                style={{
                    maxHeight: '100%',
                    width: '100%',
                    height: 'auto',
                }}
            />
            {!imageLoaded && (
                <img
                    src="https://media.istockphoto.com/id/1472933890/vector/no-image-vector-symbol-missing-available-icon-no-gallery-for-this-moment-placeholder.jpg?s=612x612&w=0&k=20&c=Rdn-lecwAj8ciQEccm0Ep2RX50FCuUJOaEM8qQjiLL0="
                    className="w-full h-full object-contain"
                />
            )}
        </div>
    );
};

export default SmallImage;
