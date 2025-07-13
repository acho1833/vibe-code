'use client';

const ErrorPage = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
                <p className="text-lg">Please try again later.</p>
            </div>
        </div>
    );
}

export default ErrorPage;
