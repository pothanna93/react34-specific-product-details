import {Component} from 'react'
import Cookies from 'js-cookie'
import {Link} from 'react-router-dom'
import Loader from 'react-loader-spinner'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import Header from '../Header'

import SimilarProductItem from '../SimilarProductItem'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    productDetails: {},
    similarProductsItems: [],
    apiStatus: apiStatusConstants.initial,
    quantity: 1,
  }

  componentDidMount() {
    this.getProductDetails()
  }

  getFormattedData = data => ({
    brand: data.brand,
    id: data.id,
    title: data.title,

    price: data.price,
    rating: data.rating,
    availability: data.availability,
    description: data.description,
    imageUrl: data.image_url,
    totalReviews: data.total_reviews,
  })

  getProductDetails = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const apiUrl = ` https://apis.ccbp.in/products/${id}`
    const jwtToken = Cookies.get('jwt_token')

    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(apiUrl, options)

    if (response.ok) {
      const fetchedData = await response.json()
      const updatedData = this.getFormattedData(fetchedData)
      const updatedSimilarProductsData = fetchedData.similar_products.map(
        eachItem => this.getFormattedData(eachItem),
      )

      this.setState({
        productDetails: updatedData,
        similarProductsItems: updatedSimilarProductsData,
        apiStatus: apiStatusConstants.success,
      })
    }
    if (response.status === 404) {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderLoadingView = () => (
    <div className="products-details-loader-container" testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div className="product-failure-view-container">
      <img
        alt="failure view"
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        className="failure-view-image"
      />
      <h1 className="product-not-found-heading">Product Not Found</h1>
      <Link to="/products">
        <button type="button" className="button">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  onDecrementQuantity = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prevState => ({
        quantity: prevState.quantity - 1,
      }))
    }
  }

  onIncrementQuantity = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  renderItemDetails = () => {
    const {productDetails, quantity, similarProductsItems} = this.state

    const {
      brand,
      price,
      rating,
      availability,
      imageUrl,
      description,
      title,

      totalReviews,
    } = productDetails

    return (
      <div className="app-product-container">
        <div className="product-item-container">
          <img src={imageUrl} alt="product" className="image" />
          <h1 className="title">{title}</h1>
          <p className="price">Rs {price}/-</p>
          <div className="rating-review-container">
            <p className="reviews ">{rating}</p>
            <img
              src="https://assets.ccbp.in/frontend/react-js/star-img.png"
              alt="star"
              className="star-image"
            />

            <p className="reviews">{totalReviews} Reviews</p>
          </div>
          <p className="description">{description}</p>
          <div className="label-value-container">
            <p className="label">Available:</p>
            <p className="value">{availability}</p>
          </div>
          <div className="label-value-container">
            <p className="label">Brand:</p>
            <p className="value">{brand}</p>
          </div>
        </div>
        <div className="quantity-container">
          <button
            type="button"
            className="quntity-control-button"
            testid="minus"
            onClick={this.onDecrementQuantity}
          >
            <BsDashSquare className="quntity-icon" />
          </button>
          <p>{quantity}</p>
          <button
            type="button"
            testid="plus"
            className="quntity-control-button"
            onClick={this.onIncrementQuantity}
          >
            <BsPlusSquare className="quntity-icon" />
          </button>
        </div>
        <button type="button" className="button add-to-cart-btn">
          ADD TO CART
        </button>
        <h1>Similar Products</h1>
        <ul>
          {similarProductsItems.map(eachProduct => (
            <SimilarProductItem
              key={eachProduct.id}
              eachProductDetails={eachProduct}
            />
          ))}
        </ul>
      </div>
    )
  }

  renderProductDetails = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderItemDetails()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <div>
        <Header />
        {this.renderProductDetails()}
      </div>
    )
  }
}
export default ProductItemDetails
