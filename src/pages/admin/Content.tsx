import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Content = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Content Saved",
        description: "Your changes have been saved successfully",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Website Content</h1>
          <p className="text-muted-foreground mt-1">Manage website pages and content</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pages">Website Pages</TabsTrigger>
          <TabsTrigger value="results">BECE Results</TabsTrigger>
          <TabsTrigger value="news">News & Events</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Page Selector */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold mb-4">Pages</h3>
              <div className="space-y-2">
                {["Homepage", "About Us", "Programs", "Admissions", "Contact Us"].map((page) => (
                  <button
                    key={page}
                    className="w-full text-left px-4 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Editor */}
            <div className="lg:col-span-3 bg-card rounded-xl border border-border p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Page Title</label>
                  <Input defaultValue="Welcome to Good Shepherd International School" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Page Content</label>
                  <Textarea
                    rows={10}
                    className="mt-1"
                    defaultValue="Good Shepherd International School is dedicated to providing quality education..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Preview</Button>
                  <Button variant="outline">Publish</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4">BECE Results Manager</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add and manage student BECE results to display on the website
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-2 font-medium text-sm text-muted-foreground">
                <span>Student Name</span>
                <span>English</span>
                <span>Mathematics</span>
                <span>Science</span>
                <span>Social Studies</span>
                <span>Aggregate</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                <Input placeholder="Name" />
                <Input placeholder="Grade" />
                <Input placeholder="Grade" />
                <Input placeholder="Grade" />
                <Input placeholder="Grade" />
                <Input placeholder="Auto" disabled />
              </div>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <div className="flex justify-end">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Post
            </Button>
          </div>
          
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {[
              { title: "School Reopening Announcement", date: "Dec 20, 2024", status: "Published" },
              { title: "BECE Results Released", date: "Dec 15, 2024", status: "Published" },
              { title: "Christmas Celebration", date: "Dec 10, 2024", status: "Draft" },
            ].map((post, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-sm text-muted-foreground">{post.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm px-2 py-1 rounded ${post.status === "Published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {post.status}
                  </span>
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Content;
