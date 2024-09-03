import React, { useState, useEffect, useContext } from 'react';
import Button from './Button';
import { SessionContext } from '../invisibleComponents/SessionProvider';

interface Props {
    image: {
        url: string,
        tags: Array<string>,
        upvotes: number,
        downvotes: number,
        createdAt: Date,
        updatedAt: Date,
        Locked: Boolean,
        Name: string,
        Size: number,
        Type: string,
        _id: string
    };
    onClick?: () => void;
}

const SmallImage: React.FC<Props> = ({ image, onClick }) => {
    const [imageUrl, setImageUrl] = useState(image.url);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [vote, setVote] = useState(0);
    const [voteFromSesion, setVoteFromSesion] = useState(0);
    const [upActive, setUpActive] = useState(false)
    const [downActive, setDownActive] = useState(false);

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

    const handleUpvote = () => {
        if (upActive) {
            setUpActive(false);
            setVote(0);
            changeVoteInDb(-1)
        } else {
            if (downActive) {
                changeVoteInDb(2)
            } else {
                changeVoteInDb(1)
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
            changeVoteInDb(1)
        } else {
            if (upActive) {
                changeVoteInDb(-2)
            } else {
                changeVoteInDb(-1)
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
            <img
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

                    <Button
                        onClick={handleUpvote}
                        className={upActive ? 'bg-light-secondary' : ''}
                    >
                        Up
                    </Button>
                    <span className="mx-2">{image.upvotes - image.downvotes + vote + voteFromSesion}</span>
                    <Button
                        onClick={handleDownvote}
                        className={downActive ? 'bg-light-secondary' : ''}
                    >
                        Down
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default SmallImage;
