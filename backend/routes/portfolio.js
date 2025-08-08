// import express from 'express';
// import Holding from '../models/Holding.js';
// import Historical from '../models/Historical.js';

// const router = express.Router();

// // Holdings Endpoint
// router.get('/holdings', async (req, res) => {
//   try {
//     const holdings = await Holding.find();
//     res.json(holdings);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Allocation Endpoint
// router.get('/allocation', async (req, res) => {
//   try {
//     const holdings = await Holding.find();
//     const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

//     const bySector = holdings.reduce((acc, h) => {
//       acc[h.sector] = acc[h.sector] || { value: 0, percentage: 0 };
//       acc[h.sector].value += h.value;
//       acc[h.sector].percentage = Number(((acc[h.sector].value / totalValue) * 100).toFixed(1));
//       return acc;
//     }, {});

//     const byMarketCap = holdings.reduce((acc, h) => {
//       acc[h.marketCap] = acc[h.marketCap] || { value: 0, percentage: 0 };
//       acc[h.marketCap].value += h.value;
//       acc[h.marketCap].percentage = Number(((acc[h.marketCap].value / totalValue) * 100).toFixed(1));
//       return acc;
//     }, {});

//     res.json({ bySector, byMarketCap });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Performance Endpoint
// router.get('/performance', async (req, res) => {
//   try {
//     const timeline = await Historical.find().sort({ date: 1 });
//     const latest = timeline[timeline.length - 1];
//     const oneMonthAgo = timeline[timeline.length - 2] || timeline[0];
//     const threeMonthsAgo = timeline[timeline.length - 4] || timeline[0];
//     const oneYearAgo = timeline[0];

//     const calcReturn = (current, past) => Number(((current / past - 1) * 100).toFixed(1));

//     const returns = {
//       portfolio: {
//         '1month': calcReturn(latest.portfolioValue, oneMonthAgo.portfolioValue),
//         '3months': calcReturn(latest.portfolioValue, threeMonthsAgo.portfolioValue),
//         '1year': calcReturn(latest.portfolioValue, oneYearAgo.portfolioValue)
//       },
//       nifty50: {
//         '1month': calcReturn(latest.nifty50, oneMonthAgo.nifty50),
//         '3months': calcReturn(latest.nifty50, threeMonthsAgo.nifty50),
//         '1year': calcReturn(latest.nifty50, oneYearAgo.nifty50)
//       },
//       gold: {
//         '1month': calcReturn(latest.gold, oneMonthAgo.gold),
//         '3months': calcReturn(latest.gold, threeMonthsAgo.gold),
//         '1year': calcReturn(latest.gold, oneYearAgo.gold)
//       }
//     };

//     res.json({ timeline, returns });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Summary Endpoint
// router.get('/summary', async (req, res) => {
//   try {
//     const holdings = await Holding.find();
//     if (!holdings || holdings.length === 0) {
//       return res.status(404).json({ error: 'No holdings found' });
//     }
//     const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
//     const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.avgPrice, 0);
//     const totalGainLoss = totalValue - totalInvested;
//     const totalGainLossPercent = Number((totalGainLoss / totalInvested * 100).toFixed(2));

//     const topPerformer = holdings.reduce((max, h) => h.gainLossPercent > max.gainLossPercent ? h : max);
//     const worstPerformer = holdings.reduce((min, h) => h.gainLossPercent < min.gainLossPercent ? h : min);

//     res.json({
//       totalValue,
//       totalInvested,
//       totalGainLoss,
//       totalGainLossPercent,
//       topPerformer: { symbol: topPerformer.symbol, name: topPerformer.companyName, gainPercent: topPerformer.gainLossPercent },
//       worstPerformer: { symbol: worstPerformer.symbol, name: worstPerformer.companyName, gainPercent: worstPerformer.gainLossPercent },
//       diversificationScore: 8.2,
//       riskLevel: "Moderate"
//     });
//   } catch (err) {
//     console.error('Error in /summary:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// export default router;

import express from 'express';
import Holding from '../models/Holding.js';
import Historical from '../models/Historical.js';
import mongoose from 'mongoose';

const router = express.Router();

// Holdings Endpoint - Corrected field names and removed unnecessary fields
router.get('/holdings', async (req, res) => {
  try {
    const holdings = await Holding.find();
    
    // Transform to match required structure
    const formatted = holdings.map(h => ({
      symbol: h.symbol,
      name: h.companyName,  // Align with 'name' in requirements
      quantity: h.quantity,
      avgPrice: h.avgPrice,
      currentPrice: h.currentPrice,
      sector: h.sector,
      marketCap: h.marketCap,
      value: h.value,
      gainLoss: h.gainLoss,
      gainLossPercent: h.gainLossPercent
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Holdings error:', err);
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
});

// Allocation Endpoint - Fixed percentage calculation and empty handling
router.get('/allocation', async (req, res) => {
  try {
    const holdings = await Holding.find();
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

    // Handle empty portfolio case
    if (totalValue === 0) {
      return res.json({ 
        bySector: {}, 
        byMarketCap: {} 
      });
    }

    // Sector allocation with rounding fix
    const bySector = holdings.reduce((acc, h) => {
      const sector = h.sector || 'Unknown';
      acc[sector] = acc[sector] || { value: 0, percentage: 0 };
      acc[sector].value += h.value;
      return acc;
    }, {});

    // Market cap allocation with rounding fix
    const byMarketCap = holdings.reduce((acc, h) => {
      const cap = h.marketCap || 'Unknown';
      acc[cap] = acc[cap] || { value: 0, percentage: 0 };
      acc[cap].value += h.value;
      return acc;
    }, {});

    // Calculate percentages
    Object.keys(bySector).forEach(sector => {
      bySector[sector].percentage = Number(((bySector[sector].value / totalValue) * 100).toFixed(1));
    });

    Object.keys(byMarketCap).forEach(cap => {
      byMarketCap[cap].percentage = Number(((byMarketCap[cap].value / totalValue) * 100).toFixed(1));
    });

    res.json({ bySector, byMarketCap });
  } catch (err) {
    console.error('Allocation error:', err);
    res.status(500).json({ error: 'Failed to calculate allocation' });
  }
});

// Performance Endpoint - Fixed date format and empty data handling
router.get('/performance', async (req, res) => {
  try {
    const timelineData = await Historical.find().sort({ date: 1 });
    
    // Format timeline to match requirements
    const timeline = timelineData.map(item => ({
      date: item.date.toISOString().split('T')[0],  // YYYY-MM-DD format
      portfolio: item.portfolioValue,
      nifty50: item.nifty50,
      gold: item.gold
    }));

    // Handle empty case
    if (timelineData.length === 0) {
      return res.json({
        timeline: [],
        returns: {
          portfolio: { '1month': 0, '3months': 0, '1year': 0 },
          nifty50: { '1month': 0, '3months': 0, '1year': 0 },
          gold: { '1month': 0, '3months': 0, '1year': 0 }
        }
      });
    }

    // Calculate returns with safe access
    const calcReturn = (current, past) => 
      past > 0 ? Number(((current / past - 1) * 100).toFixed(1)) : 0;

    const latest = timelineData[timelineData.length - 1];
    const oneMonthAgo = timelineData.length >= 2 ? timelineData[timelineData.length - 2] : timelineData[0];
    const threeMonthsAgo = timelineData.length >= 4 ? timelineData[timelineData.length - 4] : timelineData[0];
    const oneYearAgo = timelineData[0];

    const returns = {
      portfolio: {
        '1month': calcReturn(latest.portfolioValue, oneMonthAgo.portfolioValue),
        '3months': calcReturn(latest.portfolioValue, threeMonthsAgo.portfolioValue),
        '1year': calcReturn(latest.portfolioValue, oneYearAgo.portfolioValue)
      },
      nifty50: {
        '1month': calcReturn(latest.nifty50, oneMonthAgo.nifty50),
        '3months': calcReturn(latest.nifty50, threeMonthsAgo.nifty50),
        '1year': calcReturn(latest.nifty50, oneYearAgo.nifty50)
      },
      gold: {
        '1month': calcReturn(latest.gold, oneMonthAgo.gold),
        '3months': calcReturn(latest.gold, threeMonthsAgo.gold),
        '1year': calcReturn(latest.gold, oneYearAgo.gold)
      }
    };

    res.json({ timeline, returns });
  } catch (err) {
    console.error('Performance error:', err);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Summary Endpoint - Fixed calculations and added dynamic insights
router.get('/summary', async (req, res) => {
  try {
    const holdings = await Holding.find();
    
    if (!holdings || holdings.length === 0) {
      return res.status(404).json({ error: 'No holdings found' });
    }

    // Calculate core metrics
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 
      ? Number((totalGainLoss / totalInvested * 100).toFixed(2))
      : 0;

    // Find performers
    const performers = holdings.reduce((acc, h) => {
      if (!acc.top || h.gainLossPercent > acc.top.gainLossPercent) {
        acc.top = h;
      }
      if (!acc.bottom || h.gainLossPercent < acc.bottom.gainLossPercent) {
        acc.bottom = h;
      }
      return acc;
    }, { top: null, bottom: null });

    // Calculate diversification score (simplified)
    const sectorCount = new Set(holdings.map(h => h.sector)).size;
    const diversificationScore = Math.min(10, sectorCount * 2); // Max 10
    
    // Determine risk level
    const volatility = Math.sqrt(
      holdings.reduce((sum, h) => sum + Math.pow(h.gainLossPercent, 2), 0) / holdings.length
    );
    const riskLevel = volatility > 15 ? 'High' : volatility > 8 ? 'Moderate' : 'Low';

    res.json({
      totalValue,
      totalInvested,
      totalGainLoss,
      totalGainLossPercent,
      topPerformer: { 
        symbol: performers.top.symbol, 
        name: performers.top.companyName, 
        gainPercent: performers.top.gainLossPercent 
      },
      worstPerformer: { 
        symbol: performers.bottom.symbol, 
        name: performers.bottom.companyName, 
        gainPercent: performers.bottom.gainLossPercent 
      },
      diversificationScore,
      riskLevel
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;