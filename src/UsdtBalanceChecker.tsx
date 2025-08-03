import React, { useState, useEffect } from 'react';
import { TonConnectUI, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { TonClient, Address } from '@ton/ton';
import { beginCell } from '@ton/core'; // Для работы с Cell, например, для get_wallet_address

// -----------------------------------------------------------
// КОНСТАНТЫ (Mainnet)
// -----------------------------------------------------------

// Адрес мастер-контракта USDT в Mainnet
// Всегда проверяйте актуальность этого адреса на tonscan.org или у официальных источников.
const USDT_JETTON_MASTER_ADDRESS_STRING = "EQCkR1cGgjnS8-N1n33u8mB56i_S8gK6nLq0p06fXzX9bB6Wp_0sD";

// TON RPC Endpoint (можете использовать public или свой)
const TON_RPC_ENDPOINT = "https://toncenter.com/api/v2/jsonRPC"; // Public Toncenter endpoint


function UsdtBalanceChecker() {
  // Хук для взаимодействия с TonConnectUI
  const [tonConnectUI] = useTonConnectUI();
  // Хук для получения информации о подключенном кошельке
  const wallet = useTonWallet();

  const [usdtBalance, setUsdtBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Эффект для получения баланса при изменении подключения кошелька
  useEffect(() => {
    const fetchUsdtBalance = async () => {
      if (!wallet) {
        setUsdtBalance(null);
        setError('');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const client = new TonClient({ endpoint: TON_RPC_ENDPOINT });
        const ownerAddress = Address.parse(wallet.account.address);
        const usdtMasterAddress = Address.parse(USDT_JETTON_MASTER_ADDRESS_STRING);

        // 1. Получаем адрес Jetton-кошелька для USDT, принадлежащего подключенному TON-адресу
        // Для этого вызываем метод 'get_wallet_address' на мастер-контракте USDT Jetton.
        // Этот метод ожидает Cell со строкой адреса владельца.
        const walletAddressResult = await client.runMethod(
          usdtMasterAddress,
          "get_wallet_address",
          [{ type: "slice", cell: beginCell().storeAddress(ownerAddress).endCell() }]
        );

        if (!walletAddressResult.stack || walletAddressResult.stack.length === 0) {
          throw new Error("Не удалось получить адрес Jetton-кошелька.");
        }

        const jettonWalletAddress = walletAddressResult.stack.readAddress();
        console.log("Адрес USDT Jetton-кошелька:", jettonWalletAddress.toString());

        // 2. Получаем данные из найденного Jetton-кошелька (баланс)
        // Вызываем метод 'get_wallet_data' на Jetton-кошельке.
        // Он возвращает баланс, владельца, мастер-адрес Jetton, код и данные.
        const jettonWalletDataResult = await client.runMethod(
          jettonWalletAddress,
          "get_wallet_data",
          [] // Этот метод не требует аргументов
        );

        if (!jettonWalletDataResult.stack || jettonWalletDataResult.stack.length === 0) {
          throw new Error("Не удалось получить данные из Jetton-кошелька. Возможно, у вас нет USDT или кошелек еще не активирован.");
        }

        const balanceNanoUsdt = jettonWalletDataResult.stack.readBigNumber(); // Баланс в нано-единицах (BigNumber)
        setUsdtBalance(balanceNanoUsdt.toString()); // Сохраняем как строку для точности

      } catch (err) {
        console.error("Ошибка при получении баланса USDT:", err);
        setError(`Ошибка: ${err.message || 'Неизвестная ошибка'}.`);
        setUsdtBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsdtBalance();
  }, [wallet]); // Зависимость: эффект будет перезапускаться при изменении объекта wallet

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Баланс USDT (nanoUSDT)</h1>
      <TonConnectUI /> {/* Этот компонент TonConnectUI предоставляет кнопку подключения */}

      {wallet ? (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>Подключенный кошелек:</h3>
          <p>Адрес: <code>{wallet.account.address}</code></p>
          <p>Сеть: <code>{wallet.account.chain}</code></p>
          <p>Тип: <code>{wallet.account.stateInit?.type || 'unknown'}</code></p>

          <h3 style={{ marginTop: '15px' }}>Баланс USDT:</h3>
          {isLoading && <p>Загрузка баланса...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {usdtBalance !== null && (
            <div>
              <p>
                Ваш баланс USDT: <strong>{usdtBalance}</strong> nanoUSDT
              </p>
              <p>
                ({Number(usdtBalance) / (10**9)} USDT)
              </p>
            </div>
          )}
        </div>
      ) : (
        <p style={{ marginTop: '20px' }}>Подключите кошелек, чтобы узнать баланс USDT.</p>
      )}
    </div>
  );
}

export default UsdtBalanceChecker;