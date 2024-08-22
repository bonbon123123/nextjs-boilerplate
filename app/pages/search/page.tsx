"use client";
import React, { useState, useEffect } from 'react';
import SmallImage from '../../components/SmallImage';
import BigImage from '../../components/BigImage';

interface Post {
    id: number;
    title: string;
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
}

const SearchPage = () => {
    const [tags, setTags] = useState("");
    const [images, setImages] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState<Post[][]>([]);
    const [selectedImage, setSelectedImage] = useState<Post | null>(null);
    const [showBigImage, setIsBigImageVisible] = useState(false);



    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        const response = await fetch(`/api/mongo?tags=${tags}`);
        const data = await response.json();
        setImages(data);
        setLoading(false);
    };

    useEffect(() => {
        if (images.length > 0) {
            const columns: Post[][] = [];
            for (let i = 0; i < 4; i++) {
                columns.push([]);
            }
            images.forEach((image, index) => {
                columns[index % 4].push(image);
            });
            setColumns(columns);
        }
    }, [images]);

    const handleSearch = () => {
        fetchImages();
    };

    const handleImageClick = (image: Post) => {
        handleCloseBigImage
        setSelectedImage(image);
    };

    const handleCloseBigImage = () => {
        setSelectedImage(null);
    };

    return (
        <div>
            <div className="search-bar">
                <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Search for tags"
                />
                <button onClick={handleSearch}>Search</button>
            </div>
            <div className="w-100% flex ">
                {loading ? (
                    <p>Loading...</p>
                ) : (

                    columns.map((column, index) => (
                        <div key={index} className="w-1/4">
                            {column.map((image) => (
                                <SmallImage
                                    key={image.id}
                                    image={image}
                                    onClick={() => handleImageClick(image)}
                                />
                            ))}
                        </div>
                    ))

                )}
            </div>
            {selectedImage && (
                <BigImage
                    image={selectedImage}
                    onClose={handleCloseBigImage}
                />
            )}
        </div>
    );
};

export default SearchPage;