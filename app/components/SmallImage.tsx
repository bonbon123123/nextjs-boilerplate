import React, { useState, useEffect, useContext } from 'react';
import Button from './Button';
import { SessionContext } from '../invisibleComponents/SessionProvider';
import Image from 'next/image';
import Post from '../interfaces/Post';


interface Props {
    image: Post
    onClick?: () => void;
}

const SmallImage: React.FC<Props> = ({ image, onClick }) => {
    const [imageUrl, setImageUrl] = useState(image.url);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [voteFromDb, setVoteFromDb] = useState(0);
    const sessionContext = useContext(SessionContext);


    if (!sessionContext) {
        throw new Error('SessionContext is not provided');
    }

    const { addVote, getVote, addSave, getSave, votes, savedPosts } = sessionContext;

    const initialVote = getVote(image._id) || 0;
    const initialIsSaved = getSave(image._id);

    const [vote, setVote] = useState(initialVote);
    const [isSaved, setIsSaved] = useState(initialIsSaved);

    useEffect(() => {
        setVote(getVote(image._id) || 0);
        setIsSaved(getSave(image._id));
    }, [votes, savedPosts, image._id]);

    const handleSave = async () => {
        if (sessionContext.userId) {
            addSave(image._id);
            setIsSaved(!isSaved);

        } else {
            console.log('You must be logged in to save posts');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch('/api/mongo/posts', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: image._id,
                    userId: sessionContext.userId,
                    imageUrl: image.url
                }),
            });
            const data = await response.json();
            if (response.ok) {
                console.log(data.message);
                setIsDeleted(true);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleUpvote = () => {
        const currentVote = getVote(image._id);
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
        if (currentVote === -1) {
            setVote(0);
            addVote(image._id, 0);
        } else {
            setVote(-1);
            addVote(image._id, -1);
        }
    };


    const handleImageError = () => {
        setImageUrl('/images/NoImage.png');
    };

    const handleImageLoad = () => {
        setImageUrl(image.url)
        setImageLoaded(true);
    };

    if (image.upvotes != 0) {
        // console.log(sessionContext.userRole)
        //console.log(image)
        // console.log(image.upvotes - image.downvotes)
    }

    return (
        <div
            className="relative overflow-hidden"
            style={{
                maxHeight: 'calc(100vw / 2)',
            }}
        >
            {isDeleted ? (
                <div className="flex justify-center items-center h-full">
                    <span className="text-lg">Image was Deleted</span>
                </div>
            ) : (
                <div>
                    <div
                        className="absolute top-0 left-0 w-[100%] flex flex-row justify-end"
                        style={{ zIndex: 90 }}

                    >
                        {image.userId === sessionContext.userId || sessionContext.userRole === 'admin' ? (
                            <Button onClick={handleDelete}>
                                Delete
                            </Button>
                        ) : null}


                        <Button onClick={handleSave} clicked={isSaved}>
                            Save
                        </Button>
                    </div>
                    <Image
                        alt={"Big image"}
                        width={image.width}
                        height={image.height}
                        src={imageUrl}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        className="w-full object-cover"
                        unoptimized={imageUrl.startsWith('/images/')}
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

                            <span className="mx-2">{image.upvotes - image.downvotes + vote - voteFromDb}</span>
                            <Button onClick={handleDownvote} clicked={vote == -1}>
                                Down
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
};

export default SmallImage;
