import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { Layout } from '../components/global/Layout';
import { useToast } from '../hooks/useToast';
import { candidatesService } from '../services/candidates';

import { z } from 'zod';
import { isAdmin } from '../utils/auth';

type CandidateForm = {
  name: string;
  email: string;
  role_applied: string;
  skills: string;
};

export function CandidatesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    skill: '',
  });
  const [activeFilters, setActiveFilters] = useState({
    status: '',
    role: '',
    skill: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const form = useForm<CandidateForm>({
    resolver: zodResolver(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      role_applied: z.string().min(1),
      skills: z.string().min(1),
    })),
    defaultValues: {
      name: '',
      email: '',
      role_applied: '',
      skills: '',
    },
  });

  // Initialize filters from URL and reset page
  useEffect(() => {
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const skill = searchParams.get('skill') || '';
    const initialFilters = { status, role, skill };
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  }, [searchParams]);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['candidates', activeFilters, page],
    queryFn: () => candidatesService.listCandidates({ ...activeFilters, page, page_size: PAGE_SIZE }),
  });

  const candidates = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  const addCandidateMutation = useMutation({
    mutationFn: candidatesService.createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Candidate added successfully.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add candidate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setActiveFilters(filters);
    setPage(1);
    const params: Record<string, string> = {};
    if (filters.status) params.status = filters.status;
    if (filters.role) params.role = filters.role;
    if (filters.skill) params.skill = filters.skill;
    setSearchParams(params);
  };

  const handleClear = () => {
    const emptyFilters = { status: '', role: '', skill: '' };
    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setPage(1);
    setSearchParams({});
  };

  const deleteCandidateMutation = useMutation({
    mutationFn: (id: number) => candidatesService.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast({
        title: "Success",
        description: "Candidate deleted successfully.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete candidate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitCandidate = (data: CandidateForm) => {
    // Split comma-separated skills string into array
    const skillsArray = data.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    addCandidateMutation.mutate({
      ...data,
      skills: skillsArray,
    });
  };

  const handleDeleteCandidate = (id: number) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      deleteCandidateMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Candidates</h2>
          {isAdmin() && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Candidate</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Candidate</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitCandidate)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role_applied"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Applied</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Software Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills (comma separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. React, Node.js, Python" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addCandidateMutation.isPending}>
                        {addCandidateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Candidate"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <Input
            placeholder="Filter by status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          />
          <Input
            placeholder="Filter by role"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          />
          <Input
            placeholder="Filter by skill"
            value={filters.skill}
            onChange={(e) => handleFilterChange('skill', e.target.value)}
          />
          <Button onClick={handleSearch}>Search</Button>
          <Button variant="outline" onClick={handleClear}>Clear</Button>
        </div>

        <div className="grid gap-4">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">{candidate.email}</p>
                  <p className="text-sm">{candidate.role_applied}</p>
                  <p className="text-sm">Status: {candidate.status}</p>
                  <p className="text-sm">Skills: {candidate.skills.join(', ')}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link to={`/candidates/${candidate.id}`}>View Details</Link>
                  </Button>
                  {isAdmin() && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      disabled={deleteCandidateMutation.isPending}
                    >
                      {deleteCandidateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}