import React, { useState } from 'react';
import Navbar from './Navbar';
import './styling/AboutUs.css';

const AboutUs = () => {
    const team = [
        {
            name: 'Ryan Fernald',
            bio: "Ryan is our awesome front end developer, specializing in both the UI and UX design components for everything you see and interact with on this application!",
            photo: `${process.env.PUBLIC_URL}/profile-photos/ryan.jpg`
        },
        {
            name: 'Sean Hsieh',
            bio: "Sean is our full-stack developer, specializing in backend development and infrastructure. Like many other students, he's powered by coffee. If you ever get the chance to meet him in person, buy him a coffee!",
            photo: `${process.env.PUBLIC_URL}/profile-photos/sean.jpg`
        },
        {
            name: 'Maxim Dokukin',
            bio: 'Able to take in a lot of chaos and turn it into something manageable.',
            photo: `${process.env.PUBLIC_URL}/profile-photos/max.jpg`
        },
        {
            name: 'Ashkan Nikfarjam',
            bio: 'A dedicated Data Science student at San Jose State University with passion for the realm of Machine Learning, AI, and Data Analysis!',
            photo: `${process.env.PUBLIC_URL}/profile-photos/ashkan.jpg`
        },
        {
            name: 'Varun Ranjan',
            bio: 'Varun is our database and middleware specialist, who built critical pipelines for data retrieval and API operations from Yahoo Finance!',
            photo: `${process.env.PUBLIC_URL}/profile-photos/varun.jpg`
        },
    ];

    return (
        <div>
        <Navbar />    
            <div className="about-us-page">
                <div className="about-project">
                    <h1>About Our Project</h1>
                    <p>
                        Our team worked collaboratively to create an innovative stock market app 
                        designed to help users make informed decisions. 
                        <p>
                        This app combines real-time 
                        data, interactive charts, and a user-friendly interface to deliver an 
                        exceptional experience.
                        </p>
                    </p>
                </div>
                <div className="meet-the-team">
                    <h2>Meet the Team</h2>
                    <div className="team-grid">
                        {team.map((member, index) => (
                            <div className="team-member" key={index}>
                                <img src={member.photo} alt={`${member.name}`} className="profile-photo" />
                                <h3>{member.name}</h3>
                                <p>{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;