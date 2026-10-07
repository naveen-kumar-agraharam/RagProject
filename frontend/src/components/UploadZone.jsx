/**
 * PDF Upload Zone Component
 * Clean light AI SaaS drag & drop upload area with progress & validation.
 * Preserves exact upload API and processing logic.
 */

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload, File, CheckCircle2, AlertCircle,
  Loader2, FileText, Sparkles, X
} from 'lucide-react'
import { documentsApi } from '../services/api'
import toast from 'react-hot-toast'

const MAX_FILE_SIZE_MB = 50

const FileUploadItem = ({ file, status, progress, error, result, onRemove }) => {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2)

  return (
    <div className="clean-card p-4 space-y-3 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
          ${status === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : status === 'error'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-primary-50 text-primary-900 border border-primary-200'
          }
        `}>
          {status === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : status === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          ) : (
            <FileText className="w-5 h-5 text-primary-900" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
          <p className="text-xs text-slate-500">{sizeMB} MB</p>
        </div>

        {status === 'uploading' && (
          <Loader2 className="w-4 h-4 text-primary-900 animate-spin flex-shrink-0 mt-1" />
        )}
        {status !== 'uploading' && onRemove && (
          <button
            onClick={onRemove}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {status === 'uploading' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Uploading & indexing vectors...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-primary-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Result */}
      {status === 'success' && result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800 flex items-center justify-between">
          <span>Processed {result.num_pages} pages into {result.num_chunks} vector chunks</span>
          <span className="font-semibold text-emerald-900">Indexed</span>
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-800">
          <p className="font-semibold">Processing error</p>
          <p className="mt-0.5">{error || 'Failed to process document'}</p>
        </div>
      )}
    </div>
  )
}

const UploadZone = ({ onUploadSuccess }) => {
  const [uploads, setUploads] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = async (file) => {
    const fileId = `${file.name}-${Date.now()}`
    setUploads((prev) => [
      ...prev,
      { id: fileId, file, status: 'uploading', progress: 0 },
    ])
    setIsProcessing(true)

    try {
      const result = await documentsApi.upload(file, (progress) => {
        setUploads((prev) =>
          prev.map((item) =>
            item.id === fileId ? { ...item, progress } : item
          )
        )
      })

      setUploads((prev) =>
        prev.map((item) =>
          item.id === fileId
            ? { ...item, status: 'success', progress: 100, result }
            : item
        )
      )
      toast.success(`Successfully indexed ${file.name}!`)
      if (onUploadSuccess) onUploadSuccess(result)
    } catch (err) {
      setUploads((prev) =>
        prev.map((item) =>
          item.id === fileId
            ? { ...item, status: 'error', error: err.message }
            : item
        )
      )
      toast.error(`Upload failed: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      const errorMsg = rejection.errors[0]?.message || 'File validation failed'
      toast.error(errorMsg)
      return
    }

    acceptedFiles.forEach((file) => {
      processFile(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    multiple: true,
  })

  const removeUpload = (id) => {
    setUploads((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Drop Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer
          transition-all duration-200 flex flex-col items-center justify-center
          ${isDragActive
            ? 'border-primary-600 bg-primary-50/50 scale-[0.99]'
            : 'border-slate-300 bg-white hover:border-primary-600 hover:bg-slate-50/70'
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-900 mb-4 shadow-sm">
          <Upload className="w-7 h-7" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Drag & Drop your PDF here
        </h3>

        <p className="text-xs text-slate-500 my-1.5">or</p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            open()
          }}
          className="btn-primary text-xs px-5 py-2"
        >
          Browse Files
        </button>

        <div className="mt-4 pt-4 border-t border-slate-100 w-full max-w-xs flex items-center justify-center gap-2 text-xs text-slate-400">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Supported format: PDF (up to {MAX_FILE_SIZE_MB}MB)</span>
        </div>
      </div>

      {/* Upload Items Progress & Results */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Upload Queue ({uploads.length})</span>
            {uploads.some((u) => u.status === 'success') && (
              <button
                onClick={() => setUploads((prev) => prev.filter((u) => u.status === 'uploading'))}
                className="text-primary-900 hover:underline"
              >
                Clear finished
              </button>
            )}
          </div>

          <div className="grid gap-3">
            {uploads.map((item) => (
              <FileUploadItem
                key={item.id}
                file={item.file}
                status={item.status}
                progress={item.progress}
                error={item.error}
                result={item.result}
                onRemove={() => removeUpload(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadZone
