import React, { useEffect, useState } from 'react';

// Декларация для веб-компонента <lottie-player>, если еще не объявлена
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        background?: string;
        speed?: string;
        loop?: string;
        autoplay?: string;
        controls?: string;
        mode?: string;
        direction?: string;
        hover?: string;
      };
    }
  }
}

interface NotificationToastProps {
  message: string;
  animationUrl: string;
  type: 'success' | 'warning' | 'info'; // Тип для стилизации (зеленый, желтый, синий)
  duration?: number; // Длительность показа в мс, по умолчанию 2500 (2.5 секунды)
  onClose: () => void; // Функция для закрытия уведомления
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  animationUrl,
  type,
  duration = 2500, // Явно установлено на 2.5 секунды
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Показываем уведомление с небольшой задержкой для анимации
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Скрываем уведомление через заданное время
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      // После завершения анимации скрытия, вызываем onClose
      // console.log('NotificationToast: Calling onClose after hide animation.'); // Для отладки
      setTimeout(onClose, 300); // Соответствует transition-duration
    }, duration);

    // Очистка таймеров при размонтировании компонента или изменении зависимостей
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  // Определение цвета фона в зависимости от типа
  let bgColorClass = 'bg-gray-700'; // По умолчанию
  if (type === 'success') {
    bgColorClass = 'bg-green-600';
  } else if (type === 'warning') {
    bgColorClass = 'bg-yellow-600';
  } else if (type === 'info') {
    bgColorClass = 'bg-blue-600';
  }

  // Функция для закрытия уведомления
  const handleCloseToast = () => {
    setIsVisible(false);
    // console.log('NotificationToast: Manual close triggered.'); // Для отладки
    setTimeout(onClose, 300); // Дожидаемся анимации скрытия
  };

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2
                  max-w-72 w-auto mx-4 p-3 rounded-lg shadow-lg flex items-center space-x-3
                  transition-all duration-300 ease-out z-50
                  ${bgColorClass}
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}
                  cursor-pointer min-h-[70px]`}
      role="alert" // Для доступности
      onClick={handleCloseToast} // Теперь весь блок закрывается по клику
    >
      {/* Lottie-анимация */}
      <lottie-player
        src={animationUrl}
        loop="true"
        autoplay="true"
        style={{ width: '50px', height: '50px', flexShrink: 0 }} // Увеличен размер анимации
      ></lottie-player>

      {/* Текст сообщения */}
      <p className="text-white text-sm font-semibold flex-grow">{message}</p>

      {/* Кнопка закрытия (теперь опциональна, так как весь блок кликабелен) */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Предотвращаем срабатывание onClick родительского div
          handleCloseToast();
        }}
        className="text-white opacity-70 hover:opacity-100 transition-opacity duration-200"
        aria-label="Закрыть уведомление"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

export default NotificationToast;
