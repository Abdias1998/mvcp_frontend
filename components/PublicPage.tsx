import React, { useState, useEffect } from 'react';
import { api } from '../services/api.real';
import { Report, Event } from '../types.ts';
import { SpinnerIcon, CalendarIcon, XIcon } from './icons.tsx';

const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div 
        className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in" 
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
        <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={imageUrl} alt="Agrandissement de l'image de l'évènement" className="block max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
            <button 
                onClick={onClose} 
                className="absolute -top-3 -right-3 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-200 shadow-lg transition-colors"
                aria-label="Fermer l'image"
            >
                <XIcon className="h-6 w-6" />
            </button>
        </div>
    </div>
);

const EventCard: React.FC<{ event: Event; onImageClick: (imageUrl: string) => void; }> = ({ event, onImageClick }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 h-full">
        {event.imageUrl && (
            <button 
                onClick={() => onImageClick(event.imageUrl!)} 
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-xl overflow-hidden block"
                aria-label={`Agrandir l'image pour ${event.title}`}
            >
                <img src={event.imageUrl} alt={event.title} className="h-48 w-full object-contain bg-gray-100 cursor-pointer transform hover:scale-105 transition-transform duration-300"/>
            </button>
        )}
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 my-2">
                <CalendarIcon className="h-5 w-5 text-blue-600"/>
                <span>{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <p className="text-sm text-gray-600 font-semibold">{event.location}</p>
            <p className="text-gray-700 mt-3 flex-grow">{event.description}</p>
        </div>
    </div>
);


const PublicPage: React.FC = () => {
    const [testimony, setTestimony] = useState<Report | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [imageInModal, setImageInModal] = useState<string | null>(null);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             setLoading(true);
    //             const eventsData = await api.getPublicEvents();
    //             setEvents(eventsData);

    //             let testimonyData = await api.getFeaturedTestimony();
    //             if (!testimonyData) {
    //                 testimonyData = await api.getRandomPoignantTestimony();
    //             }
    //             setTestimony(testimonyData);
    //         } catch (error) {
    //             console.error("Erreur lors du chargement des annonces:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, []);
    
    if (loading) {
        return <div className="flex justify-center items-center p-20"><SpinnerIcon className="h-16 w-16 text-blue-700"/></div>;
    }

    const renderEvents = () => {
        if (events.length === 0) {
            return (
                <div className="text-center bg-white p-12 rounded-xl shadow-md">
                    <CalendarIcon className="mx-auto h-16 w-16 text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">Aucun évènement à venir</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Revenez bientôt pour de nouvelles annonces.
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                    <EventCard key={event.id} event={event} onImageClick={setImageInModal} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <header className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Annonces de la Communauté</h1>
                <p className="text-lg text-gray-600">Restez informés des évènements à venir et laissez-vous inspirer par ce que Dieu fait.</p>
            </header>

            {/* --- Testimony of the Day --- */}
            {testimony && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">✨ Témoignage du Jour ✨</h2>
                    <div className="max-w-3xl mx-auto bg-yellow-50 p-6 rounded-xl shadow-lg border-t-4 border-yellow-400">
                        <p className="text-lg text-gray-800 italic text-center">"{testimony.poignantTestimony}"</p>
                        <p className="text-right text-sm font-semibold text-gray-600 mt-4">- Cellule {testimony.cellName} ({testimony.region})</p>
                    </div>
                </section>
            )}

            {/* --- Upcoming Events --- */}
            <section className="pb-8">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">Évènements à Venir</h2>
                {renderEvents()}
            </section>

            {imageInModal && <ImageModal imageUrl={imageInModal} onClose={() => setImageInModal(null)} />}
        </div>
    );
};

export default PublicPage;