import React, { useState, useEffect, useContext } from 'react';
import Button from './Button';
import { SessionContext } from '../invisibleComponents/SessionProvider';
import Image from 'next/image';

interface Props {
    image: {
        url: string;
        tags: Array<string>;
        upvotes: number;
        downvotes: number;
        createdAt: Date;
        updatedAt: Date;
        width: number;
        height: number;
        locked: Boolean;
        name: string;
        size: number;
        type: string;
        _id: string;
    };
    onClick?: () => void;
}

const SmallImage: React.FC<Props> = ({ image, onClick }) => {
    const [imageUrl, setImageUrl] = useState(image.url);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [vote, setVote] = useState(0);

    const sessionContext = useContext(SessionContext);

    if (!sessionContext) {
        throw new Error('SessionContext is not provided');
    }

    const { addVote, getVote } = sessionContext;


    useEffect(() => {
        const currentVote = getVote(image._id);
        if (typeof currentVote === "number") {
            setVote(currentVote)
        }
    }, [image._id]);


    const handleUpvote = () => {
        const currentVote = getVote(image._id);
        console.log(currentVote)
        console.log(currentVote)
        if (currentVote === 1) {
            setVote(0);
            addVote(image._id, 0);
        } else {
            setVote(1);
            addVote(image._id, 1);
        }
    };

    const handleDownvote = () => {
        const currentVote = getVote(image._id);
        console.log(currentVote)
        if (currentVote === -1) {
            setVote(0);
            addVote(image._id, 0);
        } else {
            setVote(-1);
            addVote(image._id, -1);
        }
    };


    const handleImageError = () => {
        setImageUrl('https://media.istockphoto.com/id/1472933890/vector/no-image-vector-symbol-missing-available-icon-no-gallery-for-this-moment-placeholder.jpg?s=612x612&w=0&k=20&c=Rdn-lecwAj8ciQEccm0Ep2RX50FCuUJOaEM8qQjiLL0=');
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };
    if (image.upvotes != 0) {
        // console.log(image.tags)
        // console.log(image.upvotes - image.downvotes)
    }

    return (
        <div
            className="relative overflow-hidden"
            style={{
                maxHeight: 'calc(100vw / 2)',
            }}
        >
            <Image
                alt={"Big image"}
                width={image.width}
                height={image.height}
                src={image.url}
                onError={handleImageError}
                onLoad={handleImageLoad}
                className="w-full object-cover"
                onClick={onClick}
                style={{
                    maxHeight: '100%',
                    width: '100%',
                    height: 'auto',
                }}

            />
            <div
                className="absolute bottom-0 left-0 w-[100%] h-[20%] bg-gradient-to-b from-transparent to-light-main"
                style={{ zIndex: 90 }}

            />
            <div
                className="absolute bottom-0 left-0 w-[100%] rounded-lg flex center flex-col justify-center items-center"
                style={{ zIndex: 100 }}
            >
                <div className="w-[100%]  flex flex-row justify-center items-center mb-2">
                    {image.tags?.map((tag, index) => {
                        return (
                            <span
                                key={index}
                                className="bg-secondary p-1 h-[80%] rounded-lg mr-2.5"
                            >
                                #{tag}
                            </span>
                        );
                    })}
                </div>
                <div className="w-[100%] flex flex-row justify-end items-center">

                    <Button onClick={handleUpvote} clicked={vote == 1}>
                        Up
                    </Button>

                    <span className="mx-2">{image.upvotes - image.downvotes + vote}</span>
                    <Button onClick={handleDownvote} clicked={vote == -1}>
                        Down
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default SmallImage;
