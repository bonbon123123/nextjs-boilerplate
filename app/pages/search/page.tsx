"use client";
import React, { useState, useEffect } from 'react';
import SmallImage from '../../components/SmallImage';

interface Post {
    id: number;
    title: string;
    url: string;
    tags: Array<string>;
    upvotes: Number;
    downvotes: Number;
    createdAt: Date;
    updatedAt: Date;
    Locked: Boolean;
    Name: string;
    Size: Number;
    Type: string;
    _id: string;
}

const SearchPage = () => {
    const [tags, setTags] = useState("");
    const [images, setImages] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState<Post[][]>([]);

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
                                <SmallImage key={image.id} image={image} />
                            ))}
                        </div>
                    ))

                )}
            </div>
        </div>
    );
};

export default SearchPage;