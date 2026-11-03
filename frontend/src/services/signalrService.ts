import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export const getSignalRConnection = () => {
  if (!connection) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
    const baseUrl = import.meta.env.VITE_API_BASE_URL || origin;
    const hubUrl = `${baseUrl.replace('/api/v1', '')}/hubs/notifications`;

    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.start().catch((err) => {
      console.warn('SignalR Real-Time Connection Warning:', err);
    });
  }
  return connection;
};

