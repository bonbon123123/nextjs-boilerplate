import React, { useState, useEffect } from 'react';
import Button from './Button';

interface Props {
    image: {
        url: string;
        tags: Array<string>;
        upvotes: number;
        downvotes: number;
        createdAt: Date;
        updatedAt: Date;
        Locked: Boolean;
        Name: string;
        Size: number;
        Type: string;
        _id: string;
    };
    onClose?: () => void;
}

const BigImage: React.FC<Props> = ({ image, onClose }) => {
    const [imageUrl, setImageUrl] = useState(image.url);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [vote, setVote] = useState(0);
    const [upActive, setUpActive] = useState(false);
    const [downActive, setDownActive] = useState(false);

    const handleUpvote = () => {
        if (upActive) {
            setUpActive(false);
            setVote(0);
            changeVoteInDb(-1);
        } else {
            if (downActive) {
                changeVoteInDb(2);
            } else {
                changeVoteInDb(1);
            }
            setUpActive(true);
            setDownActive(false);
            setVote(1);
        }
    };

    const handleDownvote = () => {
        if (downActive) {
            setDownActive(false);
            setVote(0);
            changeVoteInDb(1);
        } else {
            if (upActive) {
                changeVoteInDb(-2);
            } else {
                changeVoteInDb(-1);
            }
            setDownActive(true);
            setUpActive(false);
            setVote(-1);
        }
    };

    const changeVoteInDb = (voteValue: number) => {
        console.log('Change vote in DB function called!');
        fetch('/api/mongo', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: image._id, vote: voteValue }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error updating vote: ${response.status}`);
                }
                return response.text();
            })
            .then(data => console.log(data))
            .catch(error => console.error(error));
    };

    const handleImageError = () => {
        setImageUrl('https://media.istockphoto.com/id/1472933890/vector/no-image-vector-symbol-missing-available-icon-no-gallery-for-this-moment-placeholder.jpg?s=612x612&w=0&k=20&c=Rdn-lecwAj8ciQEccm0Ep2RX50FCuUJOaEM8qQjiLL0=');
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <div
            className="fixed top-[10%] left-0 bottom-[10%] w-full h-auto bg-black bg-opacity-50 flex flex-row"
            style={{ zIndex: 1000 }}
        >
            <div
                className="bg-secondary w-1/5 h-full overflow-y-auto flex flex-col justify-center items-center"

            >
                {/* content 1 */}
            </div>
            <div
                className="w-3/5 h-full overflow-y-auto flex flex-col justify-center items-center bg-main"
                style={{ backgroundColor: 'white' }}
            >
                <img
                    src={imageUrl}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    className="w-full h-full object-cover"
                    style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        height: 'auto',
                        width: 'auto',
                    }}
                />
            </div>
            <div
                className="bg-secondary w-1/5 h-full overflow-y-auto flex flex-col justify-end items-center"

            >
                {/* content 3 */}
                <div className="w-full flex flex-row justify-end items-center mb-2">
                    {image.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-secondary p-1 h-[80%] rounded-lg mr-2.5"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
                <Button onClick={handleUpvote} className={upActive ? 'bg-light-secondary' : ''}>
                    Up
                </Button>
                <span className="mx-2">{image.upvotes - image.downvotes + vote}</span>
                <Button onClick={handleDownvote} className={downActive ? 'bg-light-secondary' : ''}>
                    Down
                </Button>
            </div>
            <div
                className=" h-full overflow-y-auto flex flex-col justify-center items-center"
                style={{ backgroundColor: 'white' }}
            >
                {/* Add comments section here */}
            </div>
            <div
                className="absolute top-0 right-0 p-2"
                style={{ zIndex: 1001 }}
            >
                <Button onClick={onClose}>
                    ×
                </Button>
            </div>
        </div>
    );
};

export default BigImage;