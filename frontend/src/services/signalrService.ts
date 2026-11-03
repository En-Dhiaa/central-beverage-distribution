import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export const getSignalRConnection = () => {
  if (!connection) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
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
