import React, { useRef, useEffect } from 'react';
import lottie from 'lottie-web'; // Импортируем lottie-web

interface LottieAnimationProps {
    animationData?: object; // Объект JSON с данными анимации (если загружен локально)
    animationUrl?: string; // URL к .json или .tgs файлу анимации
    loop?: boolean;
    autoplay?: boolean;
    className?: string; // Для стилизации через Tailwind CSS
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
    animationData,
    animationUrl,
    loop = true,
    autoplay = true,
    className
}) => {
    const animationContainer = useRef<HTMLDivElement>(null);
    const lottieInstance = useRef<any>(null); // Храним экземпляр Lottie анимации

    useEffect(() => {
        if (animationContainer.current) {
            // Если экземпляр Lottie уже существует, уничтожаем его, чтобы избежать утечек памяти
            if (lottieInstance.current) {
                lottieInstance.current.destroy();
            }

            lottieInstance.current = lottie.loadAnimation({
                container: animationContainer.current, // DOM-элемент для рендеринга
                renderer: 'svg', // svg лучше для масштабирования, canvas для сложных анимаций
                loop: loop,
                autoplay: autoplay,
                animationData: animationData, // Либо данные
                path: animationUrl,           // Либо URL
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid slice' // Поведение масштабирования
                }
            });
        }

        // Функция очистки при размонтировании компонента
        return () => {
            if (lottieInstance.current) {
                lottieInstance.current.destroy();
                lottieInstance.current = null;
            }
        };
    }, [animationData, animationUrl, loop, autoplay]); // Зависимости: пересоздаем анимацию, если данные/URL/параметры меняются

    return (
        <div ref={animationContainer} className={className} />
    );
};

export default LottieAnimation;