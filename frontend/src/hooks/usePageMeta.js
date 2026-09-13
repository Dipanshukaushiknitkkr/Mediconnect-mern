import { useEffect } from 'react';

/**
 * Custom hook to dynamically set document title and meta description per route
 * @param {string} title - Page title (e.g. "Find Doctors", "How It Works")
 * @param {string} description - Optional page meta description
 */
export const usePageMeta = (title, description) => {
  useEffect(() => {
    const defaultTitle = 'MediConnect | Online Doctor Consultations & Digital Prescriptions';
    document.title = title ? `${title} | MediConnect` : defaultTitle;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
};

export default usePageMeta;
