import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Trash2, Pencil, Loader2 } from 'lucide-react';
import { Layout } from '../components/global/Layout';
import { useToast } from '../hooks/useToast';
import { candidatesService } from '../services/candidates';
import { scoreFormSchema, candidateUpdateSchema } from '../schemas';
import { isAdmin } from '../utils/auth';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import type { AISummary } from '../types';

type ScoreForm = {
  category: string;
  score: number;
  note?: string;
};

export function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => id ? candidatesService.getCandidate(parseInt(id)) : null,
    enabled: !!id,
  });

  const getSummaryMutation = useMutation({
    mutationFn: () => candidatesService.getAISummary(parseInt(id!)),
    onSuccess: (data) => {
      setSummary(data);
      toast({
        title: "Success",
        description: "AI summary generated.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI summary.",
        variant: "destructive",
      });
    },
  });

  const submitScoreMutation = useMutation({
    mutationFn: (data: ScoreForm) => candidatesService.submitScore(parseInt(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate', id] });
      form.reset();
      toast({
        title: "Success",
        description: "Score submitted successfully.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit score. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: () => candidatesService.deleteCandidate(parseInt(id!)),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Candidate deleted successfully.",
        variant: "success",
      });
      navigate('/candidates');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete candidate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: (data: z.infer<typeof candidateUpdateSchema>) => 
      candidatesService.updateCandidate(parseInt(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate', id] });
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Candidate updated successfully.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update candidate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const editForm = useForm<z.infer<typeof candidateUpdateSchema>>({
    resolver: zodResolver(candidateUpdateSchema),
    defaultValues: {
      status: candidate?.status || '',
      internal_notes: candidate?.internal_notes || '',
    },
  });

  const form = useForm<ScoreForm>({
    resolver: zodResolver(scoreFormSchema),
    defaultValues: {
      category: '',
      score: 1,
      note: '',
    },
  });

  const handleGetSummary = () => {
    getSummaryMutation.mutate();
  };

  const onSubmitScore = (data: ScoreForm) => {
    submitScoreMutation.mutate(data);
  };

  const handleDeleteCandidate = () => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      deleteCandidateMutation.mutate();
    }
  };

  const onSubmitEdit = (data: z.infer<typeof candidateUpdateSchema>) => {
    updateCandidateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  if (!candidate) {
    return (
      <Layout>
        <div className="text-center">Candidate not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">{candidate.name}</h2>
            <Button 
            onClick={handleGetSummary}
            disabled={getSummaryMutation.isPending}
          >
            {getSummaryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Get AI Summary"
            )}
          </Button>
            {isAdmin() && (
              <>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Candidate</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                        <FormField
                          control={editForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <FormControl>
                                <Input placeholder="Status" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="internal_notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Internal Notes</FormLabel>
                              <FormControl>
                                <Input placeholder="Internal notes" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="submit" 
                            disabled={updateCandidateMutation.isPending}
                          >
                            {updateCandidateMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  onClick={handleDeleteCandidate}
                  disabled={deleteCandidateMutation.isPending}
                >
                  {deleteCandidateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Candidate
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Details</h3>
            <p>Email: {candidate.email}</p>
            <p>Role: {candidate.role_applied}</p>
            <p>Status: {candidate.status}</p>
            <p>Skills: {candidate.skills.join(', ')}</p>
            {candidate.internal_notes && (
              <p>Notes: {candidate.internal_notes}</p>
            )}
          </div>

          {(getSummaryMutation.isPending || summary) && (
            <div>
              <h3 className="font-semibold">AI Summary</h3>
              {getSummaryMutation.isPending ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <p>{summary?.summary}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Scores</h3>
          <div className="space-y-2">
            {candidate.scores.map((score) => (
              <div key={score.id} className="border rounded p-2">
                <p>Category: {score.category}</p>
                <p>Score: {score.score}/5</p>
                {score.note && <p>Note: {score.note}</p>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Add Score</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitScore)} className="flex gap-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Score (1-5)"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Note (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={submitScoreMutation.isPending}>
                {submitScoreMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}