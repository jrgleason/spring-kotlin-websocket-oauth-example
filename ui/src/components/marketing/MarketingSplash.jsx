import React from 'react';

const MarketingSplash = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation */}
            <nav className="px-4 py-5">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="text-2xl font-bold text-indigo-600">CompanyName</div>
                    <div className="hidden md:flex space-x-6">
                        <a href="#" className="text-gray-600 hover:text-indigo-600">Features</a>
                        <a href="#" className="text-gray-600 hover:text-indigo-600">Pricing</a>
                        <a href="#" className="text-gray-600 hover:text-indigo-600">About</a>
                        <a href="#" className="text-gray-600 hover:text-indigo-600">Contact</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Transform Your Business with Our Solution
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Empower your team with cutting-edge tools that drive innovation and accelerate growth.
                        Join thousands of successful businesses that trust our platform.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                            Get Started
                        </button>
                        <button className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Seamless Integration",
                                description: "Connect with your favorite tools and workflows without any hassle."
                            },
                            {
                                title: "Advanced Analytics",
                                description: "Get detailed insights and metrics to make data-driven decisions."
                            },
                            {
                                title: "24/7 Support",
                                description: "Our dedicated team is always here to help you succeed."
                            }
                        ].map((feature, index) => (
                            <div key={index} className="p-6 bg-gray-50 rounded-lg">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg mb-4 flex items-center justify-center">
                                    <div className="w-6 h-6 bg-indigo-600 rounded"></div>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-gray-600 mb-8">
                        Join over 10,000+ companies already growing with our platform.
                    </p>
                    <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                        Start Free Trial
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketingSplash;