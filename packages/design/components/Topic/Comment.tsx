import React, { FC, useState } from 'react'
import { Reply, Comment as IComment, User } from '@bangumi/types'
import { Friend, OriginalPoster, TopicClosed, TopicSilent, TopicReopen } from '@bangumi/icons'
import classNames from 'classnames'
import { render as renderBBCode } from '@bangumi/utils'
import Avatar from '../../components/Avatar'
import RichContent from '../../components/RichContent'
import Typography from '../../components/Typography'
import Button from '../../components/Button'
import EditorForm from '../../components/EditorForm'
import CommentInfo from './CommentInfo'

export type CommentProps =
  ((Reply & { isReply: true }) | (IComment & { isReply: false }))
  & {
    floor: string | number
    originalPosterId: number
    user?: User
  }

const Link = Typography.Link

const RenderContent: FC<{ state: number, text: string }> = (
  {
    state,
    text
  }
) => {
  switch (state) {
    case 0:
      return <RichContent html={renderBBCode(text)} classname="bgm-comment__content" />
    case 1:
      return <div className="bgm-comment__content">关闭了该主题</div>
    case 2:
      return <div className="bgm-comment__content">重新开启了该主题</div>
    case 5:
      return <div className="bgm-comment__content">下沉了该主题</div>
    case 6:
      return <div className="bgm-comment__content--deleted">内容已被用户删除</div>
    case 7:
      return (
        <div className="bgm-comment__content--deleted">
          内容因违反「
          <Link
            to="https://bgm.tv/about/guideline"
            isExternal
          >
            社区指导原则
          </Link>
          」已被删除
        </div>
      )
    default:
      return null
  }
}

const Comment: FC<CommentProps> = ({
  text,
  creator,
  created_at: createAt,
  floor,
  is_friend: isFriend,
  originalPosterId,
  state,
  user,
  ...props
}) => {
  const isReply = props.isReply
  const isDeleted = state === 6 || state === 7
  // 1 关闭 2 重开 5 下沉
  const isSpecial = state === 1 || state === 2 || state === 5
  const replies = !isReply ? props.replies : null
  const [shouldCollapsed, setShouldCollapsed] = useState(isSpecial || (isReply && ((/[+-]\d+$/.test(text) || isDeleted))))
  const [showReplyEditor, setShowReplyEditor] = useState(false)

  const headerClassName = classNames('bgm-comment__header', {
    'bgm-comment__header--reply': isReply,
    'bgm-comment__header--collapsed': shouldCollapsed
  })

  if (shouldCollapsed) {
    let icon = null
    switch (state) {
      case 0:
        icon = null
        break
      case 1:
        icon = <TopicClosed />
        break
      case 2:
        icon = <TopicReopen />
        break
      case 5:
        icon = <TopicSilent />
        break
    }

    return (
      <div
        className={headerClassName} onClick={isSpecial ? undefined : () => setShouldCollapsed(false)}
        id={`post_${props.id}`}
      >
        <span className="bgm-comment__tip">
          <div className="creator-info">
            {
              icon
            }
            <Link to={creator.url} isExternal>{creator.nickname}</Link>
            <RenderContent state={state} text={text} />
          </div>
          <CommentInfo createdAt={createAt} floor={floor} isSpecial={isSpecial} />
        </span>
      </div>
    )
  }

  return (
    <div>
      <div className={headerClassName} id={`post_${props.id}`}>
        <Avatar src={creator.avatar.large} size={isReply ? 'small' : 'medium'} />
        <div className="bgm-comment__box">
          <div className="bgm-comment__main">
            <span className="bgm-comment__tip">
              <div className="creator-info">
                <Link to={creator.url} isExternal>{creator.nickname}</Link>
                {
                  originalPosterId === creator.id ? <OriginalPoster /> : null
                }
                {
                  isFriend ? <Friend /> : null
                }
                {
                  !isReply
                    // Todo: XSS ?
                    ? creator.sign
                      ? <span dangerouslySetInnerHTML={{ __html: `// ${creator.sign}` }} />
                      : null
                    : null
                }
              </div>
              <CommentInfo createdAt={createAt} floor={floor} />
            </span>
            <RenderContent state={state} text={text} />
          </div>
          <div className="bgm-comment__opinions">
            {
              showReplyEditor
                ? (
                  <EditorForm
                    onCancel={() => setShowReplyEditor(false)}
                    placeholder={`回复给 @${creator.nickname}：`}
                  />
                  )
                : (
                  <>
                    <Button type="secondary" shape="rounded" onClick={() => setShowReplyEditor(true)}>回复</Button>
                    <Button type="secondary" shape="rounded">+1</Button>
                    {
                      user?.id === creator.id
                        ? (
                          <>
                            <Button type="text">编辑</Button>
                            <Button type="text">删除</Button>
                          </>
                          )
                        : null
                    }
                  </>
                  )
            }
          </div>
        </div>
      </div>
      {
        replies?.map((reply, idx) => (
          <Comment
            key={reply.id}
            isReply
            floor={`${floor}-${idx + 1}`}
            originalPosterId={originalPosterId}
            user={user}
            {...reply}
          />
        ))
      }
    </div>
  )
}

export default Comment
