class APIFeatures {

  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // SEARCH by keyword (searches name field)
  search() {
    const keyword = this.queryString.keyword
      ? {
        name: {
          $regex: this.queryString.keyword,
          $options: "i",
        },
      }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  // FILTER (supports price[gte], price[lte], category, etc.)
  filter() {
    const queryCopy = { ...this.queryString };
    const removeFields = ["keyword", "page", "limit", "sort"];
    removeFields.forEach((key) => delete queryCopy[key]);

    // Convert to MongoDB operators: price[gte] => price: { $gte: value }
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // SORT
  sort() {
    if (this.queryString.sort) {
      // e.g. sort=price or sort=-price (descending)
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // Default: newest first
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  // PAGINATION
  pagination(resultPerPage) {
    const currentPage = Number(this.queryString.page) || 1;
    const skip = resultPerPage * (currentPage - 1);
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }

}

module.exports = APIFeatures;