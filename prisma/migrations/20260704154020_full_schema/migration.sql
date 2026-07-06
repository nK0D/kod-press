-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nicename" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "registered" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL DEFAULT 0,
    "displayName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserMeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "UserMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "authorId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateGmt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "commentStatus" TEXT NOT NULL DEFAULT 'open',
    "pingStatus" TEXT NOT NULL DEFAULT 'open',
    "password" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "modified" DATETIME NOT NULL,
    "modifiedGmt" DATETIME NOT NULL,
    "parent" INTEGER NOT NULL DEFAULT 0,
    "guid" TEXT NOT NULL DEFAULT '',
    "menuOrder" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'post',
    "mimeType" TEXT NOT NULL DEFAULT '',
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostMeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "PostMeta_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Term" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "termGroup" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "TermMeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "TermMeta_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TermTaxonomy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER NOT NULL,
    "taxonomy" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "parent" INTEGER NOT NULL DEFAULT 0,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TermTaxonomy_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TermRelationship" (
    "objectId" INTEGER NOT NULL,
    "termTaxonomyId" INTEGER NOT NULL,
    "termOrder" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("objectId", "termTaxonomyId"),
    CONSTRAINT "TermRelationship_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TermRelationship_termTaxonomyId_fkey" FOREIGN KEY ("termTaxonomyId") REFERENCES "TermTaxonomy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "authorName" TEXT NOT NULL DEFAULT '',
    "authorEmail" TEXT NOT NULL DEFAULT '',
    "authorUrl" TEXT NOT NULL DEFAULT '',
    "authorIP" TEXT NOT NULL DEFAULT '',
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateGmt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "karma" INTEGER NOT NULL DEFAULT 0,
    "approved" TEXT NOT NULL DEFAULT '1',
    "agent" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'comment',
    "parent" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommentMeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "commentId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "CommentMeta_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Link" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "target" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "visible" TEXT NOT NULL DEFAULT 'Y',
    "userId" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rel" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "rss" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_login_idx" ON "User"("login");

-- CreateIndex
CREATE INDEX "UserMeta_userId_idx" ON "UserMeta"("userId");

-- CreateIndex
CREATE INDEX "UserMeta_key_idx" ON "UserMeta"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- CreateIndex
CREATE INDEX "Post_type_idx" ON "Post"("type");

-- CreateIndex
CREATE INDEX "Post_parent_idx" ON "Post"("parent");

-- CreateIndex
CREATE INDEX "Post_date_idx" ON "Post"("date");

-- CreateIndex
CREATE INDEX "PostMeta_postId_idx" ON "PostMeta"("postId");

-- CreateIndex
CREATE INDEX "PostMeta_key_idx" ON "PostMeta"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Term_slug_key" ON "Term"("slug");

-- CreateIndex
CREATE INDEX "TermMeta_termId_idx" ON "TermMeta"("termId");

-- CreateIndex
CREATE INDEX "TermMeta_key_idx" ON "TermMeta"("key");

-- CreateIndex
CREATE INDEX "TermTaxonomy_taxonomy_idx" ON "TermTaxonomy"("taxonomy");

-- CreateIndex
CREATE INDEX "TermTaxonomy_parent_idx" ON "TermTaxonomy"("parent");

-- CreateIndex
CREATE UNIQUE INDEX "TermTaxonomy_termId_taxonomy_key" ON "TermTaxonomy"("termId", "taxonomy");

-- CreateIndex
CREATE INDEX "TermRelationship_termTaxonomyId_idx" ON "TermRelationship"("termTaxonomyId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_approved_idx" ON "Comment"("approved");

-- CreateIndex
CREATE INDEX "Comment_parent_idx" ON "Comment"("parent");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "CommentMeta_commentId_idx" ON "CommentMeta"("commentId");

-- CreateIndex
CREATE INDEX "CommentMeta_key_idx" ON "CommentMeta"("key");
