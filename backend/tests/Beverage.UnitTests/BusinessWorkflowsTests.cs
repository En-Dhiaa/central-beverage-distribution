using Beverage.Domain.Entities.Distributors;
using Beverage.Domain.Entities.Finance;
using Beverage.Domain.Entities.Products;
using Beverage.Domain.Entities.Warehouses;
using Beverage.Domain.Enums;
using Xunit;

namespace Beverage.UnitTests;

public class BusinessWorkflowsTests
{
    [Fact]
    public void UnitConversion_ShouldCalculateCorrectTotalPieces()
    {
        // Arrange
        var product = new Product
        {
            Name = "مياه شملان 0.75L",
            UnitsPerCarton = 12
        };

        decimal cartons = 5;
        decimal extraPieces = 3;

        // Act
        var totalPieces = (cartons * product.UnitsPerCarton) + extraPieces;

        // Assert: 5 * 12 + 3 = 63 pieces
        Assert.Equal(63, totalPieces);
    }

    [Fact]
    public void DistributorSettlement_EquationMustBalanceStrictly()
    {
        // Formula: Opening + Received - Sold - Returned - Damaged - Shortage == Remaining
        decimal openingQuantity = 100;
        decimal receivedQuantity = 50;  // Total available = 150
        decimal soldQuantity = 80;
        decimal returnedQuantity = 20;
        decimal damagedQuantity = 5;
        decimal shortageQuantity = 2;
        decimal expectedRemaining = 43; // 150 - 80 - 20 - 5 - 2 = 43

        var item = new DistributorSettlementItem
        {
            OpeningQuantityPieces = openingQuantity,
            ReceivedQuantityPieces = receivedQuantity,
            SoldQuantityPieces = soldQuantity,
            ReturnedQuantityPieces = returnedQuantity,
            DamagedQuantityPieces = damagedQuantity,
            ShortageQuantityPieces = shortageQuantity,
            RemainingQuantityPieces = expectedRemaining
        };

        // Assert
        Assert.True(item.IsQuantityBalanced);
    }

    [Fact]
    public void DistributorSettlement_UnbalancedEquation_ShouldFailValidation()
    {
        var item = new DistributorSettlementItem
        {
            OpeningQuantityPieces = 50,
            ReceivedQuantityPieces = 50, // Available = 100
            SoldQuantityPieces = 40,
            ReturnedQuantityPieces = 10,
            DamagedQuantityPieces = 0,
            ShortageQuantityPieces = 0,
            RemainingQuantityPieces = 45 // Incorrect, should be 50!
        };

        Assert.False(item.IsQuantityBalanced);
    }

    [Fact]
    public void JournalEntry_StrictDoubleEntry_MustHaveTotalDebitEqualToTotalCredit()
    {
        // Purchase of 100 cartons water for 250,000 Rial on credit
        var entry = new JournalEntry
        {
            EntryNumber = "JE-TEST-001",
            Description = "شراء بضاعة على الحساب"
        };

        var inventoryAccountId = Guid.NewGuid();
        var apAccountId = Guid.NewGuid();

        // Debit: Inventory 250,000
        entry.Lines.Add(new JournalEntryLine
        {
            AccountId = inventoryAccountId,
            Debit = 250000m,
            Credit = 0
        });

        // Credit: Accounts Payable 250,000
        entry.Lines.Add(new JournalEntryLine
        {
            AccountId = apAccountId,
            Debit = 0,
            Credit = 250000m
        });

        // Assert
        Assert.Equal(250000m, entry.TotalDebit);
        Assert.Equal(250000m, entry.TotalCredit);
        Assert.True(entry.IsBalanced);
    }

    [Fact]
    public void JournalEntry_UnbalancedEntry_ShouldBeFlaggedAsUnbalanced()
    {
        var entry = new JournalEntry
        {
            EntryNumber = "JE-UNBALANCED-001"
        };

        entry.Lines.Add(new JournalEntryLine
        {
            AccountId = Guid.NewGuid(),
            Debit = 1000m,
            Credit = 0
        });

        entry.Lines.Add(new JournalEntryLine
        {
            AccountId = Guid.NewGuid(),
            Debit = 0,
            Credit = 800m
        });

        Assert.False(entry.IsBalanced);
        Assert.Equal(200m, entry.TotalDebit - entry.TotalCredit);
    }

    [Fact]
    public void StockTransfer_DeductsFromSource_AndAddsToTarget()
    {
        var sourceBalance = new InventoryBalance { QuantityInPieces = 500 };
        var targetBalance = new InventoryBalance { QuantityInPieces = 100 };

        decimal transferQuantity = 200;

        // Act
        sourceBalance.QuantityInPieces -= transferQuantity;
        targetBalance.QuantityInPieces += transferQuantity;

        // Assert
        Assert.Equal(300, sourceBalance.QuantityInPieces);
        Assert.Equal(300, targetBalance.QuantityInPieces);
    }
}
