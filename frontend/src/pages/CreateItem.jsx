import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { itemsAPI } from '../services/api'
import { Upload, Calendar, DollarSign, FileText, Image, Link, X } from 'lucide-react'
import toast from 'react-hot-toast'

const CreateItem = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [imageMethod, setImageMethod] = useState('url') // 'url' or 'upload'
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    imageURL: '',
    endTime: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
      
      // Clear URL input when file is selected
      setFormData({
        ...formData,
        imageURL: ''
      })
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.startingPrice) {
      newErrors.startingPrice = 'Starting price is required'
    } else if (isNaN(formData.startingPrice) || parseFloat(formData.startingPrice) <= 0) {
      newErrors.startingPrice = 'Starting price must be a positive number'
    }

    if (imageMethod === 'url') {
      if (!formData.imageURL.trim()) {
        newErrors.imageURL = 'Image URL is required'
      } else if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.imageURL)) {
        newErrors.imageURL = 'Please provide a valid image URL'
      }
    } else {
      if (!selectedFile) {
        newErrors.imageURL = 'Please select an image file'
      }
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    } else {
      const endDate = new Date(formData.endTime)
      const now = new Date()
      if (endDate <= now) {
        newErrors.endTime = 'End time must be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      let imageURL = formData.imageURL
      
      // If file is selected, convert to base64
      if (imageMethod === 'upload' && selectedFile) {
        imageURL = await convertFileToBase64(selectedFile)
      }

      const itemData = {
        ...formData,
        imageURL,
        startingPrice: parseFloat(formData.startingPrice),
        endTime: new Date(formData.endTime).toISOString()
      }

      const response = await itemsAPI.createItem(itemData)
      toast.success('Item created successfully!')
      navigate(`/item/${response.data.item._id}`)
    } catch (error) {
      console.error('Create item error:', error)
      console.error('Error response:', error.response?.data)
      
      let message = 'Failed to create item'
      
      if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors
        message = validationErrors.map(err => err.msg).join(', ')
      } else if (error.message) {
        message = error.message
      }
      
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Set default end time to 7 days from now
  const getDefaultEndTime = () => {
    const now = new Date()
    now.setDate(now.getDate() + 7)
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Auction Item</h1>
        <p className="mt-2 text-gray-600">
          List your item for auction and let bidders compete for it
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Item Details</h2>
          </div>
          
          <div className="card-content space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Item Title *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter item title"
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`input ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe your item in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Image *
              </label>
              
              {/* Method Selection */}
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setImageMethod('url')
                    handleRemoveFile()
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    imageMethod === 'url'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Link className="h-4 w-4" />
                  <span>Image URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageMethod('upload')
                    setFormData({ ...formData, imageURL: '' })
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    imageMethod === 'upload'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload File</span>
                </button>
              </div>

              {/* URL Input */}
              {imageMethod === 'url' && (
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    id="imageURL"
                    name="imageURL"
                    value={formData.imageURL}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.imageURL ? 'border-red-500' : ''}`}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              {/* File Upload */}
              {imageMethod === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="fileInput"
                  />
                  <label
                    htmlFor="fileInput"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP (MAX. 10MB)</p>
                    </div>
                  </label>
                  
                  {/* File Preview */}
                  {imagePreview && (
                    <div className="mt-4 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {errors.imageURL && (
                <p className="mt-1 text-sm text-red-600">{errors.imageURL}</p>
              )}
              
              {imageMethod === 'url' && (
                <p className="mt-1 text-xs text-gray-500">
                  Provide a direct link to an image (JPG, PNG, GIF, WebP)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Auction Settings</h2>
          </div>
          
          <div className="card-content space-y-6">
            <div>
              <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Starting Price ($) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  id="startingPrice"
                  name="startingPrice"
                  min="0"
                  step="0.01"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.startingPrice ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {errors.startingPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.startingPrice}</p>
              )}
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                Auction End Time *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime || getDefaultEndTime()}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.endTime ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Choose when your auction should end
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Creating Item...' : 'Create Auction Item'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateItem
