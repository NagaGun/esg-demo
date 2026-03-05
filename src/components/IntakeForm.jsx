import { useState } from 'react'
import validateWithAI from '../agents/validator'
import { parsePDFWithAI } from '../agents/pdfParser'

function IntakeForm({ onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    companyName: '',
    startDate: '',
    endDate: '',
    energyType: '',
    unit: '',
    usageAmount: ''
  })

  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [validating, setValidating] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [warnings, setWarnings] = useState([])

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setParsing(true)
    const text = await file.text()
    const extracted = await parsePDFWithAI(text)
    if (extracted && Object.keys(extracted).length > 0) {
      setFormData(prev => ({ ...prev, ...extracted }))
    }
    setParsing(false)
  }

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => {
      const next = { ...prev }
      if (next[field]) delete next[field]
      if (next.ai) delete next.ai
      return next
    })
  }

  function validate() {
    const newErrors = {}

    if (!formData.companyName) {
      newErrors.companyName = 'Company name is required'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    if (!formData.energyType) {
      newErrors.energyType = 'Please select an energy type'
    }
    if (!formData.unit) {
      newErrors.unit = 'Please select a unit'
    }
    if (!formData.usageAmount) {
      newErrors.usageAmount = 'Usage amount is required'
    } else if (formData.usageAmount <= 0) {
      newErrors.usageAmount = 'Usage amount must be greater than zero'
    }

    return newErrors
  }

  async function handleSubmit() {
    const newErrors = validate()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setValidating(true)
    setWarnings([])
    const result = await validateWithAI(formData)
    setValidating(false)

    if (!result.isValid) {
      setErrors({ ai: result.issues.join('. ') })
      return
    }

    if (result.warnings?.length) {
      setWarnings(result.warnings)
    }

    setSubmitted(true)
    if (onSubmitSuccess) onSubmitSuccess()
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Data Submitted</h2>
          <p className="text-gray-500">Your energy data has been received. Your consultant will review it shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Submit Energy Data</h1>
          <p className="text-gray-500 mt-1">Please complete all fields before submitting</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">

          {/* File Upload */}
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
            <p className="text-gray-600 text-sm mb-4">Upload a utility bill and AI will fill the form automatically</p>
            <input
              type="file"
              id="bill-upload"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              disabled={parsing}
              className="hidden"
            />
            <label
              htmlFor="bill-upload"
              className={`inline-block cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${parsing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {parsing ? 'Reading bill with AI...' : 'Upload Utility Bill'}
            </label>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={e => handleChange('companyName', e.target.value)}
              placeholder="e.g. Cruz Foam"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.companyName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
          </div>

          {/* Reporting Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => handleChange('startDate', e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.startDate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => handleChange('endDate', e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.endDate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Energy Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Energy Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.energyType}
              onChange={e => handleChange('energyType', e.target.value)}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.energyType ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            >
              <option value="">Select energy type</option>
              <option value="electricity">Electricity</option>
              <option value="natural_gas">Natural Gas</option>
              <option value="diesel">Diesel</option>
              <option value="steam">Steam</option>
            </select>
            {errors.energyType && <p className="text-red-500 text-xs mt-1">{errors.energyType}</p>}
          </div>

          {/* Unit + Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unit}
                onChange={e => handleChange('unit', e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.unit ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              >
                <option value="">Select unit</option>
                <option value="kWh">kWh</option>
                <option value="MWh">MWh</option>
                <option value="therms">Therms</option>
                <option value="mmbtu">MMBtu</option>
                <option value="gallons">Gallons</option>
              </select>
              {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.usageAmount}
                onChange={e => handleChange('usageAmount', e.target.value)}
                placeholder="e.g. 1500"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.usageAmount ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.usageAmount && <p className="text-red-500 text-xs mt-1">{errors.usageAmount}</p>}
            </div>
          </div>

          {/* Error Banner */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm font-medium">
                ⚠ {Object.keys(errors).length} issue{Object.keys(errors).length > 1 ? 's' : ''} found — please fix before submitting
              </p>
              {errors.ai && <p className="text-red-600 text-sm mt-2">{errors.ai}</p>}
            </div>
          )}

          {/* Warnings Banner */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm font-medium mb-1">Warnings</p>
              <ul className="text-amber-700 text-sm list-disc list-inside space-y-0.5">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={validating}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors text-sm"
          >
            {validating ? 'Validating with AI...' : 'Submit Energy Data'}
          </button>

        </div>
      </div>
    </div>
  )
}

export default IntakeForm