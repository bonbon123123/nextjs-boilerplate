import React, { useState, useEffect, useContext } from 'react';
import Button from './Button';
import CommentSection from './CommentSection';
import CommentForm from './CommentForm';
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
    const [voteFromSesion, setVoteFromSesion] = useState(0);
    const [upActive, setUpActive] = useState(false);
    const [downActive, setDownActive] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState(false);

    const sessionContext = useContext(SessionContext);

    if (!sessionContext) {
        throw new Error('SessionContext is not provided');
    }

    const { addVote, getVote } = sessionContext;

    useEffect(() => {
        try {
            const currentVote = getVote(image._id);
            console.log('currentVote:', currentVote);
            if (currentVote !== null && currentVote !== undefined && typeof currentVote === 'number') {
                setVote(currentVote);

                switch (currentVote) {
                    case -1:
                        setUpActive(false);
                        setDownActive(true);
                        setVoteFromSesion(1);
                        break;
                    case 1:
                        setUpActive(true);
                        setDownActive(false);
                        setVoteFromSesion(-1);
                        break;
                    default:
                        setUpActive(false);
                        setDownActive(false);
                        setVoteFromSesion(0);
                        break;
                }
                console.log(currentVote)
            } else {
                //console.error('Błąd: currentVote nie jest liczbą');
            }
        } catch (error) {
            console.error(error);
        }
    }, [image._id]);

    useEffect(() => {
        // 
    }, [getVote]);

    const handleCommentOn = () => {
        setShowCommentForm(!showCommentForm);
        console.log(image._id)
    };

    const handleCommentOff = () => {
        setShowCommentForm(true);
    };

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
        fetch('/api/mongo/posts', {
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
                else {
                    addVote(image._id, voteValue + vote);
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
                <Image
                    alt={""}
                    src={image.url}
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
                className="bg-main w-1/5 h-full overflow-y-auto flex flex-col justify-start items-center"

            >
                <div
                    className="w-full top-0 right-0 p-1 flex justify-end items-end"
                    style={{ zIndex: 1001 }}
                >
                    <Button onClick={onClose}>
                        ×
                    </Button>
                </div>
                <div className="bg-light-main w-full flex flex-row justify-center items-center mb-2">
                    {image.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-secondary p-1 h-[80%] rounded-lg mr-2.5"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
                <div className="flex flex-row justify-between w-[100%]">
                    <div className="flex justify-start">
                        <Button onClick={handleCommentOn} className={upActive ? 'bg-light-secondary' : ''}>
                            Comment
                        </Button>
                    </div>
                    <div className="flex justify-end items-center">
                        <div className="flex flex-row items-center">
                            <Button onClick={handleUpvote} className={upActive ? 'bg-light-secondary' : ''}>
                                Up
                            </Button>
                            <Button onClick={handleDownvote} className={downActive ? 'bg-light-secondary' : ''}>
                                Down
                            </Button>
                            <span className="bg-secondary p-1 h-[80%] rounded-lg mx-2 text-lg font-bold">{image.upvotes - image.downvotes + vote + voteFromSesion}</span>
                        </div>
                    </div>
                </div>

                {showCommentForm && (
                    <div
                        className=" h-[200px] bg-slate-500 "
                    >
                        <CommentForm image={image} />
                    </div>
                )}
                <CommentSection image={image} />

            </div>



        </div>
    );
};

export default BigImage;