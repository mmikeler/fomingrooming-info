import { Card, Row, Col, Image, Space } from "antd";
import { prisma } from "../../lib/prisma";
import { Meta } from "antd/es/list/Item";
import { cleanMarkdown } from "../../lib/markdown";
import {
  ArrowRightOutlined,
  EyeOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import Link from "next/link";

export default async function BlogWidget() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { created: "desc" },
    take: 3,
    include: { author: true },
  });

  return (
    <Row gutter={16}>
      {posts.map((post) => {
        // Extract title from first h1
        const titleMatch = post.content?.match(/^#\s+(.+)$/m);
        const title = titleMatch ? cleanMarkdown(titleMatch[1]) : "Blog Post";

        // Extract first image src
        const imageMatch = post.content?.match(/!\[.*?\]\((.+?)\)/);
        const ogImage = imageMatch ? imageMatch[1] : undefined;

        const actions = [
          <Space key="heart">
            <HeartOutlined style={{ color: "#ff6b6b" }} />
            <span>104</span>
          </Space>,
          <Space key="views">
            <EyeOutlined style={{ color: "#4ecdc4" }} />
            <span>1040</span>
          </Space>,
          <Link key="permalink" href={`/blog/` + post.id}>
            <ArrowRightOutlined style={{ color: "#45b7d1" }} />
          </Link>,
        ];

        return (
          <Col key={post.id} xs={24} sm={12} md={8}>
            <Card
              actions={actions}
              hoverable
              cover={<Image draggable={false} alt={post.title} src={ogImage} />}
            >
              <Meta
                title={<strong>{title}</strong>}
                description={new Date(post.created).toLocaleDateString()}
              />
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
