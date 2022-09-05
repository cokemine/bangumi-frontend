import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { EditorForm, RichContent, Avatar, Section, Typography } from '@bangumi/design'
import GlobalLayout from '../../../../components/GlobalLayout'
import useGroupTopic from '../../../../hooks/use-group-topic'
import GroupTopicHeader from './components/GroupTopicHeader'
import styles from './index.module.less'
import { render as renderBBCode } from '@bangumi/utils'
import TopicComment from './components/TopicComment'
import { useUser } from '../../../../hooks/use-user'

const { Link } = Typography

const Topic: FC = () => {
  const { id } = useParams()
  const { topicDetail } = useGroupTopic(id!)
  const { user } = useUser()
  if (!topicDetail) {
    return null
  }
  const originalPosterId = topicDetail.creator.id
  const parsedText = renderBBCode(topicDetail.text)
  const isClosed = topicDetail.state === 1
  const { group } = topicDetail
  return (
    <GlobalLayout>
      <GroupTopicHeader
        title={topicDetail.title}
        creator={topicDetail.creator}
        createdAt={topicDetail.created_at}
        group={topicDetail.group}
      />
      <div className={styles.columnContainer}>
        <div className={styles.leftCol}>
          {/* Topic content */}
          <RichContent html={parsedText} />
          {/* Topic Comments */}
          <div className={styles.replies}>
            {
              topicDetail.comments.map((comment, idx) =>
                (
                  <TopicComment
                    key={comment.id}
                    isReply={false}
                    floor={idx + 2}
                    originalPosterId={originalPosterId}
                    {...comment}
                  />
                )
              )
            }
          </div>
          {/* Reply BBCode Editor */}
          {
            !isClosed && user && (
              <div className={styles.replyFormContainer}>
                <Avatar src={user.avatar.medium} size="medium" />
                <EditorForm
                  className={styles.replyForm}
                  placeholder="添加新回复..."
                />
              </div>
            )
          }
        </div>
        <div className={styles.rightCol}>
          <Section
            title="小组信息"
          >
            <div className={styles.groupInfo}>
              <Avatar src={group.icon} size="medium" />
              <div className={styles.groupDetails}>
                <Link to={`/group/${group.name}`}>{group.title}</Link>
                <div>{`${group.total_members} 名成员`}</div>
              </div>
            </div>
            <div
              className={styles.groupDescription}
              dangerouslySetInnerHTML={{ __html: renderBBCode(group.description) }}
            />
            <div className={styles.groupOpinions}>
              <Link to="">小组概览</Link>
              <Link to="">组内讨论</Link>
              <Link to="">小组成员</Link>
            </div>
          </Section>
        </div>
      </div>
    </GlobalLayout>
  )
}
export default Topic
