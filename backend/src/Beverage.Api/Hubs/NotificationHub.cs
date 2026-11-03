using Microsoft.AspNetCore.SignalR;

namespace Beverage.Api.Hubs;

public interface INotificationClient
{
    Task ReceiveNotification(string title, string message, string type, DateTime timestamp);
    Task StockUpdated(Guid productId, string productName, decimal newBalancePieces);
    Task SettlementApproved(Guid settlementId, string distributorName, decimal netCashCollected);
}

public class NotificationHub : Hub<INotificationClient>
{
    public async Task JoinWarehouseGroup(string warehouseId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"warehouse_{warehouseId}");
    }

    public async Task LeaveWarehouseGroup(string warehouseId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"warehouse_{warehouseId}");
    }
}

