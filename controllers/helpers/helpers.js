exports.getRequestParams = function (req, searchCol) {
  var col = req.query.col;
  var order = req.query.sort;

  var colsArray = req.query.col.split(",");
  var colObj;
  var cols = "";
  for (var i = 0; i < colsArray.length; i++) {
    var colName = `"` + colsArray[i] + `":`;
    var colValue = order;
    if (cols) cols = cols + ",";
    cols = cols + colName + colValue;
  }

  var order = req.query.sort;
  var arrow = "up";
  if (order == "-1") arrow = "down";

  /*
      console.log("\n\nreq.skip = " + req.skip)
      console.log("req.query.limit = " + req.query.limit)
      console.log("req.query.page = " + req.query.page)
      console.log("\n\n")
      */

  var vLimit = process.env.ITEMS_PER_PAGE * 1;
  if (req.query.limit) vLimit = req.query.limit * 1;
  if (vLimit == 0) vLimit = process.env.ITEMS_PER_PAGE * 1;

  var vPage = 1;
  if (req.query.page) vPage = req.query.page;

  var vSkip = 0;
  if (req.skip) vSkip = req.skip;
  else vSkip = vLimit * (vPage - 1);

  var vSearchStr = "";
  var vSearchRegex = "";
  var key = "";
  var vSearchQuery = {};
  if (req.query.search) {
    vSearchStr = req.query.search;
    vSearchRegex = new RegExp(req.query.search, "i");
    vSearchQuery[searchCol] = vSearchRegex;
  }

  var requestParams = new Object();
  requestParams.order = order;
  requestParams.arrow = arrow;
  requestParams.limit = vLimit;
  requestParams.page = vPage;
  requestParams.skip = vSkip;
  requestParams.searchStr = vSearchStr;
  requestParams.searchQuery = vSearchQuery;
  requestParams.sortObj = JSON.parse("{ " + cols + "}");

  return requestParams;
};
