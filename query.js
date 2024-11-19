db.collection.aggregate([
  //  Filtering  documents for the two dates
  {
    $match: {
      dauDateLocal: {
        $in: [
          ISODate("2024-11-13T00:00:00.000Z"),
          ISODate("2024-11-14T00:00:00.000Z"),
        ],
      },
    },
  },
  // Group by PlayerID and collect dates they played
  {
    $group: {
      _id: "$PlayerID",
      datesPlayed: { $addToSet: "$dauDateLocal" },
    },
  },
  //  Filtering players who played on both dates
  {
    $project: {
      playedOn13th: {
        $in: [ISODate("2024-11-13T00:00:00.000Z"), "$datesPlayed"],
      },
      playedOn14th: {
        $in: [ISODate("2024-11-14T00:00:00.000Z"), "$datesPlayed"],
      },
    },
  },
  {
    $match: {
      playedOn13th: true,
    },
  },
  //  Counting players who played on 13th and  also who played on 14th
  {
    $group: {
      _id: null,
      totalPlayedOn13th: { $sum: 1 },
      playedOn13thAnd14th: {
        $sum: {
          $cond: [{ $eq: ["$playedOn14th", true] }, 1, 0],
        },
      },
    },
  },
  //  Calculating the ratio
  {
    $project: {
      totalPlayedOn13th: 1,
      playedOn13thAnd14th: 1,
      ratio: {
        $multiply: [
          { $divide: ["$playedOn13thAnd14th", "$totalPlayedOn13th"] },
          100,
        ],
      },
    },
  },
]);
