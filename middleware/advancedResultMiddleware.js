const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  let reqQuery = { ...req.query };

  //this constant is to remove these fields in the array from the req.params/reqQuery bcos mongoose
  //will see them as a separate field in the database and will try searching for them
  //so we remove them and handle them specially
  const removeFields = ["select", "sort", "page", "limit"];

  //remove any params in the remove fields from the reqQuery
  removeFields.map(fields => delete reqQuery[fields]);

  //this is to put this in the form of a mongoose aggregate query i.e  age: { $gt: 17, $lt: 66 }
  //bcos the req.params will appear like this but without th $ sign
  let queryString = JSON.stringify(reqQuery).replace(
    /\b(lte|lt|gte|gt|in)\b/g,
    match => `$${match}`
  );

  query = model.find(JSON.parse(queryString));
  //for select field
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query.select(fields);
  }
  //for sort field, and if no sort field provided,is gpna sort by date by default
  if (req.query.sort) {
    const fields = req.query.sort.split(",").join(" ");
    query.sort(fields);
  } else {
    query.sort("-createdAt");
  }

  if (populate) {
    query.populate(populate);
  }

  //for pagination and limit
  //the parseInt() is because req.query is a string, so we convert to a number
  //NB this executes as a default

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query.skip(startIndex).limit(limit);

  //executing the query
  const results = await query;
  const pagination = {};

  //to check if there would be a next page
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  //to check if there would be a last page

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };
  next();
};

module.exports = advancedResults;
