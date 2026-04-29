// Generated from design/components/data-entry-new.lib.pen - Upload
import { Upload as AntUpload, Button } from 'antd'
import type { UploadProps as AntUploadProps } from 'antd'
import type { UploadListType } from 'antd/es/upload/interface'
import type { ReactNode } from 'react'

export type UploadType = 'text' | 'picture' | 'pictureCard' | 'pictureCircle' | 'dragAndDrop'
export type UploadState = 'default'
export type UploadListStatus = 'done' | 'doneNoImage' | 'error' | 'uploading' | 'upload'
export type UploadHover = true | false

export type ComponentProps = Omit<AntUploadProps, 'listType' | 'type'> & {
  type?: UploadType
  state?: UploadState
  itemStatus?: UploadListStatus
  hover?: UploadHover
  buttonText?: ReactNode
  dragTitle?: ReactNode
  dragDescription?: ReactNode
}
export type UploadComponentProps = ComponentProps

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function listTypeFor(type: UploadType): UploadListType {
  if (type === 'pictureCard') return 'picture-card'
  if (type === 'pictureCircle') return 'picture-circle'
  if (type === 'picture') return 'picture'
  return 'text'
}

export default function Upload({
  type = 'text',
  state = 'default',
  itemStatus = 'done',
  hover = false,
  buttonText = 'Upload',
  dragTitle = 'Click or drag file to this area to upload',
  dragDescription = 'Support for a single or bulk upload.',
  className,
  children,
  ...uploadProps
}: ComponentProps) {
  void state
  void itemStatus

  if (type === 'dragAndDrop') {
    return (
      <AntUpload.Dragger
        {...uploadProps}
        className={cx(
          '[&_.ant-upload-drag]:rounded-lg [&_.ant-upload-drag]:border-[var(--color-border)]',
          hover && '[&_.ant-upload-drag]:border-[var(--color-primary-hover)]',
          className
        )}
      >
        {children ?? (
          <>
            <p className="ant-upload-text">{dragTitle}</p>
            <p className="ant-upload-hint">{dragDescription}</p>
          </>
        )}
      </AntUpload.Dragger>
    )
  }

  return (
    <AntUpload
      {...uploadProps}
      listType={listTypeFor(type)}
      className={cx(
        '[&_.ant-upload-list-item]:rounded-md',
        hover && '[&_.ant-upload-select]:border-[var(--color-primary-hover)]',
        className
      )}
    >
      {children ?? <Button>{buttonText}</Button>}
    </AntUpload>
  )
}
