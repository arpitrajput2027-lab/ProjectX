"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Save, Building, Users, Briefcase, MapPin, Globe } from "lucide-react";

export function CompanyProfileView() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);

  // Forms
  const { register: registerRecruiter, handleSubmit: handleSubmitRecruiter, reset: resetRecruiter } = useForm();
  const { register: registerCompany, handleSubmit: handleSubmitCompany, reset: resetCompany } = useForm();

  const [savingRecruiter, setSavingRecruiter] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      setSessionUser(session.user);

      const { data, error } = await supabase
        .from("recruiter_profiles")
        .select("*, company_profiles(*)")
        .eq("user_id", session.user.id)
        .single();

      if (error || !data) {
        router.push("/recruiter-onboarding");
        return;
      }

      setProfile(data);
      resetRecruiter({
        full_name: data.full_name,
        designation: data.designation,
        phone: data.phone,
      });

      if (data.company_profiles) {
        setCompany(data.company_profiles);
        resetCompany({
          name: data.company_profiles.name,
          industry: data.company_profiles.industry,
          website: data.company_profiles.website,
          company_size: data.company_profiles.company_size,
          location: data.company_profiles.location,
          description: data.company_profiles.description,
        });
      }

      setLoading(false);
    }
    loadData();
  }, [router, resetRecruiter, resetCompany]);

  const onSubmitRecruiter = async (data: any) => {
    setSavingRecruiter(true);
    try {
      const { error } = await supabase
        .from("recruiter_profiles")
        .update({
          full_name: data.full_name,
          designation: data.designation,
          phone: data.phone,
        })
        .eq("id", profile.id);

      if (error) throw error;
      alert("Recruiter info saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to save recruiter info");
    } finally {
      setSavingRecruiter(false);
    }
  };

  const onSubmitCompany = async (data: any) => {
    if (!company) return;
    setSavingCompany(true);
    try {
      const { error } = await supabase
        .from("company_profiles")
        .update({
          name: data.name,
          industry: data.industry,
          website: data.website,
          company_size: data.company_size,
          location: data.location,
          description: data.description,
        })
        .eq("id", company.id);

      if (error) throw error;
      alert("Company details saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to save company details");
    } finally {
      setSavingCompany(false);
    }
  };

  if (loading) return <div className="p-24 text-center font-mono uppercase tracking-widest text-muted">Loading profile...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative animate-in fade-in duration-500">
      
      {/* Top Header */}
      <header className="mb-12">
        <h1 className="font-serif text-4xl text-ink mb-2">Company Profile</h1>
        <p className="text-sm text-ink-3">Manage your recruiter details and company representation.</p>
      </header>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Company Details */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Company Overview</h2>

          <div className="bg-white rounded-xl border border-rule-med p-6 shadow-sm">
            <h3 className="font-medium text-ink mb-6 flex items-center justify-between border-b border-rule-lt pb-4">
              <span className="flex items-center space-x-2 text-lg">
                <Building className="w-5 h-5 text-accent" />
                <span>Company Details</span>
              </span>
              <button
                onClick={handleSubmitCompany(onSubmitCompany)}
                disabled={savingCompany}
                className="text-xs bg-ink text-cream hover:bg-accent px-4 py-2 rounded-md font-medium flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingCompany ? "Saving..." : "Save Company"}</span>
              </button>
            </h3>

            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Company Name</label>
                  <input 
                    {...registerCompany("name")} 
                    className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Industry</label>
                  <input 
                    {...registerCompany("industry")} 
                    className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      {...registerCompany("website")} 
                      className="w-full bg-cream border border-rule-med rounded-md pl-9 pr-3 py-2 text-sm focus:border-accent outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Company Size</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <select 
                      {...registerCompany("company_size")} 
                      className="w-full bg-cream border border-rule-med rounded-md pl-9 pr-3 py-2 text-sm focus:border-accent outline-none appearance-none"
                    >
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Headquarters / Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    {...registerCompany("location")} 
                    className="w-full bg-cream border border-rule-med rounded-md pl-9 pr-3 py-2 text-sm focus:border-accent outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Company Description</label>
                <textarea 
                  {...registerCompany("description")} 
                  rows={5}
                  className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none resize-y" 
                />
                <p className="text-xs text-ink-3 mt-1">This description will be visible to candidates when they view your job postings.</p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Recruiter Details */}
        <div className="space-y-6">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Your Profile</h2>
          
          <div className="bg-white rounded-xl border border-rule-med p-6 shadow-sm sticky top-6">
            <h3 className="font-medium text-ink mb-6 flex items-center justify-between border-b border-rule-lt pb-4">
              <span>Recruiter Info</span>
              <button
                onClick={handleSubmitRecruiter(onSubmitRecruiter)}
                disabled={savingRecruiter}
                className="text-xs bg-ink text-cream hover:bg-accent px-3 py-1.5 rounded-md font-medium flex items-center space-x-1 transition-colors disabled:opacity-50"
              >
                <Save className="w-3 h-3" />
                <span>{savingRecruiter ? "Saving..." : "Save"}</span>
              </button>
            </h3>

            <div className="flex items-center justify-center mb-6">
               <div className="w-20 h-20 bg-ink text-white flex items-center justify-center rounded-full font-serif text-3xl uppercase shadow-md border-4 border-cream-2">
                 {profile?.full_name ? profile.full_name.charAt(0) : "U"}
               </div>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  {...registerRecruiter("full_name")} 
                  className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Designation / Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    {...registerRecruiter("designation")} 
                    className="w-full bg-cream border border-rule-med rounded-md pl-9 pr-3 py-2 text-sm focus:border-accent outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Work Email</label>
                <input 
                  value={sessionUser?.email || ""} 
                  readOnly 
                  className="w-full bg-cream-2 border border-rule-med rounded-md px-3 py-2 text-sm outline-none opacity-70 cursor-not-allowed" 
                />
                <p className="text-[10px] text-ink-3 mt-1">Email cannot be changed.</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Phone Number</label>
                <input 
                  {...registerRecruiter("phone")} 
                  className="w-full bg-cream border border-rule-med rounded-md px-3 py-2 text-sm focus:border-accent outline-none" 
                />
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
