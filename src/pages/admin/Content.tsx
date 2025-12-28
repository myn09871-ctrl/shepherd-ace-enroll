import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit, Image, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  featured_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

interface WebsiteContent {
  id: string;
  page_slug: string;
  page_title: string;
  content: unknown;
}

const Content = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [websitePages, setWebsitePages] = useState<WebsiteContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<WebsiteContent | null>(null);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  
  // Form states for new/edit post
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [postPublished, setPostPublished] = useState(false);

  // Page content states
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [newsRes, pagesRes] = await Promise.all([
        supabase.from("news_posts").select("*").order("created_at", { ascending: false }),
        supabase.from("website_content").select("*").order("page_title"),
      ]);

      const mappedPages: WebsiteContent[] = (pagesRes.data || []).map(p => ({
        id: p.id,
        page_slug: p.page_slug,
        page_title: p.page_title,
        content: p.content,
      }));
      
      setWebsitePages(mappedPages);
      
      if (mappedPages.length > 0) {
        selectPage(mappedPages[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectPage = (page: WebsiteContent) => {
    setSelectedPage(page);
    setPageTitle(page.page_title);
    const contentObj = page.content as Record<string, string> | null;
    setPageContent(contentObj?.body || "");
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("website_content")
        .update({
          page_title: pageTitle,
          content: { body: pageContent },
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedPage.id);

      if (error) throw error;

      toast({
        title: "Content Saved",
        description: "Page content has been updated successfully",
      });
      
      fetchData();
    } catch (error) {
      console.error("Error saving page:", error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openPostDialog = (post?: NewsPost) => {
    if (post) {
      setEditingPost(post);
      setPostTitle(post.title);
      setPostContent(post.content);
      setPostImageUrl(post.featured_image_url || "");
      setPostPublished(post.is_published || false);
    } else {
      setEditingPost(null);
      setPostTitle("");
      setPostContent("");
      setPostImageUrl("");
      setPostPublished(false);
    }
    setIsPostDialogOpen(true);
  };

  const handleSavePost = async () => {
    if (!postTitle || !postContent) {
      toast({
        title: "Missing Fields",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingPost) {
        const { error } = await supabase
          .from("news_posts")
          .update({
            title: postTitle,
            content: postContent,
            featured_image_url: postImageUrl || null,
            is_published: postPublished,
            published_at: postPublished ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPost.id);

        if (error) throw error;
        toast({ title: "Post Updated", description: "News post has been updated" });
      } else {
        const { error } = await supabase
          .from("news_posts")
          .insert({
            title: postTitle,
            content: postContent,
            featured_image_url: postImageUrl || null,
            is_published: postPublished,
            published_at: postPublished ? new Date().toISOString() : null,
          });

        if (error) throw error;
        toast({ title: "Post Created", description: "New post has been created" });
      }

      setIsPostDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase.from("news_posts").delete().eq("id", postId);
      if (error) throw error;
      
      toast({ title: "Post Deleted", description: "The post has been removed" });
      fetchData();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const togglePublish = async (post: NewsPost) => {
    try {
      const { error } = await supabase
        .from("news_posts")
        .update({
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : null,
        })
        .eq("id", post.id);

      if (error) throw error;
      
      toast({
        title: post.is_published ? "Post Unpublished" : "Post Published",
        description: post.is_published ? "Post is now hidden" : "Post is now visible on website",
      });
      fetchData();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground">Website Content</h1>
          <p className="text-sm text-muted-foreground">Manage website pages and content</p>
        </div>
      </div>

      <Tabs defaultValue="news" className="space-y-4">
        <TabsList>
          <TabsTrigger value="news" className="text-sm">News & Events</TabsTrigger>
          <TabsTrigger value="pages" className="text-sm">Website Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => openPostDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="Post title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Write your post content here..."
                      rows={8}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Featured Image URL (optional)</Label>
                    <Input
                      id="image"
                      value={postImageUrl}
                      onChange={(e) => setPostImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={postPublished}
                      onCheckedChange={setPostPublished}
                    />
                    <Label>Publish immediately</Label>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePost} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Post"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="bg-card rounded-lg border border-border divide-y divide-border">
            {newsPosts.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No posts yet. Click "Create New Post" to add one.
              </div>
            ) : (
              newsPosts.map((post) => (
                <div key={post.id} className="p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(post.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${post.is_published ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"}`}>
                      {post.is_published ? "Published" : "Draft"}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => togglePublish(post)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openPostDialog(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="grid lg:grid-cols-4 gap-4">
            {/* Page Selector */}
            <div className="bg-card rounded-lg border border-border p-3">
              <h3 className="text-sm font-semibold mb-3">Pages</h3>
              <div className="space-y-1">
                {websitePages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => selectPage(page)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedPage?.id === page.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {page.page_title}
                  </button>
                ))}
                {websitePages.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No pages configured
                  </p>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="lg:col-span-3 bg-card rounded-lg border border-border p-4">
              {selectedPage ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Page Title</Label>
                    <Input
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Page Content</Label>
                    <Textarea
                      rows={10}
                      value={pageContent}
                      onChange={(e) => setPageContent(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSavePage} disabled={saving} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  Select a page to edit
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Content;