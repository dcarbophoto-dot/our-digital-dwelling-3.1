
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { INTERIOR_STYLES, OUTDOOR_STYLES, ROOM_TYPES, ALL_STYLES, INTERIOR_ROOM_TYPES, EXTERIOR_SCENE_TYPES } from './constants';
import { StagingStyle, StagedItem, RoomType, HistoryItem, StyleCategory } from './types';
import { stageRoom } from './services/geminiService';
import { subscribeToAuth, login, register, logout, resetPassword, loginWithGoogle, deleteUserAccount, resendVerificationEmail } from './services/authService';
import { getUserProfile, updateUserProfile, deleteUserProfile, UserProfile, saveFileRecord, getUserFiles, FileRecord, deductCredit, createStripeCheckout, createProject, getUserProjects, ProjectRecord, setupStripeSync, createPortalLink, deleteProject, updateLastLogin } from './services/dbService';
import { resizeAndFormatImage } from './src/utils/imageExportUtils';
import { upscaleImage } from './services/upscaleService';
import { uploadBase64ToStorage } from './services/storageService';
import landingTwilight from './src/assets/landing-twilight.jpg';
import interiorStagingImg from './src/assets/interior-staging.png';
import { useStorage } from './hooks/useStorage';
import JSZip from 'jszip';
import TermsOfService from './TermsOfService';
import RefundPolicy from './RefundPolicy';
import ContactUs from './ContactUs';
import UserGuide from './UserGuide';
import { AdminDashboard } from './src/components/AdminDashboard';
import { Tutorials } from './src/components/Tutorials';
import MLSCompliance from './src/MLSCompliance';

const App: React.FC = () => {
  // Auth State

  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [showAuth, setShowAuth] = useState(false); 
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showTerms, setShowTerms] = useState(false);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showFreeTrialPromo, setShowFreeTrialPromo] = useState(false);
  
  // Forgot Password State
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  // Stripe Flow State
  const [paymentStatus, setPaymentStatus] = useState<'none' | 'success' | 'failure'>('none');
  const [paymentType, setPaymentType] = useState<'basic_sub' | 'standard_sub' | 'premium_sub' | 'top_up_25' | 'top_up_50' | 'top_up_100' | null>(null);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [showCreditPacks, setShowCreditPacks] = useState(false);
  const [showManageSubscription, setShowManageSubscription] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showTutorials, setShowTutorials] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);

  // Admin Validation
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase());
  const isAdmin = userProfile?.email ? adminEmails.includes(userProfile.email.toLowerCase()) : false;

  // Storage for items using IndexedDB to avoid localStorage quota limits
  const [items, setItems, isStorageReady] = useStorage<StagedItem[]>('our_digital_dwelling_items', []);
  
  // Project State
  const [userProjects, setUserProjects] = useState<ProjectRecord[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [loadingProjectProgress, setLoadingProjectProgress] = useState<number>(0);

  // UI Selection State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'original' | 'staged'>('staged');

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMyProjects, setShowMyProjects] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadResolution, setDownloadResolution] = useState<'2K' | '4K'>('2K');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<'staged' | 'original' | 'single'>('staged');
  const [singleDownloadItemId, setSingleDownloadItemId] = useState<string | null>(null);
  const [showWatermarkMenu, setShowWatermarkMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stripeUnsubRef = useRef<(() => void) | null>(null);

  // Pricing Constants
  const PRICING: Record<string, { id: string; name: string; description?: string; credits: number; price: string; perCredit?: string }> = {
    basic_sub: {
      id: 'price_1T1OzEIY2wu1OpEHADGXvsXV',
      name: 'Basic Subscription Plan',
      description: 'Lite plan for individual agents.',
      credits: 20,
      price: '$29.99'
    },
    standard_sub: {
      id: 'price_1T1OzVIY2wu1OpEHvMGvtAmL',
      name: 'Standard Monthly Subscription Plan',
      description: 'High-volume monthly staging subscription.',
      credits: 45,
      price: '$49.99'
    },
    premium_sub: {
      id: 'price_1T1OzcIY2wu1OpEHcjoWtrdt', 
      name: 'Premium Monthly Subscription Plan',
      description: 'Enterprise-grade monthly staging subscription.',
      credits: 100,
      price: '$99.99'
    },
    top_up_25: {
      id: 'price_1T2dYXIY2wu1OpEHx43rE2WD',
      name: 'Credit Replenishment - 25 Pack',
      credits: 25,
      price: '$39.99',
      perCredit: '$1.60 per credit'
    },
    top_up_50: {
      id: 'price_1T2dYdIY2wu1OpEHxhSwJWYO',
      name: 'Credit Replenishment - 50 Pack',
      credits: 50,
      price: '$69.99',
      perCredit: '$1.40 per credit'
    },
    top_up_100: {
      id: 'price_1T2dYiIY2wu1OpEHxCsp12Cx',
      name: 'Credit Replenishment - 100 Pack',
      credits: 100,
      price: '$119.99',
      perCredit: '$1.20 per credit'
    }
  };

  // Memoized current active item
  const activeItem = useMemo(() => items.find(i => i.id === activeId) || items[0] || null, [items, activeId]);
  const activeProject = useMemo(() => userProjects.find(p => p.id === currentProjectId), [userProjects, currentProjectId]);

  // Reactive check for insufficient credits based on selected style
  const hasInsufficientCredits = useMemo(() => {
    if (!activeItem?.currentStyle || !userProfile) return false;
    const selectedStyleObj = ALL_STYLES.find(s => s.id === activeItem.currentStyle);

    // Check if it's a refinement (previously staged + has refinement prompt)
    const history = activeItem.styleHistory[activeItem.currentStyle] || [];
    const currentIndex = activeItem.historyIndex[activeItem.currentStyle] ?? -1;
    const hasStagedImage = currentIndex >= 0 && history[currentIndex];
    const isRefinement = hasStagedImage && !!(activeItem.refinementPrompt && activeItem.refinementPrompt.trim().length > 0);

    // FREE TRIAL LOGIC: If plan is 'free', everything costs 1 credit
    const isFreePlan = userProfile.plan === 'free';
    let cost = isFreePlan ? 1 : (selectedStyleObj?.creditCost || 1);
    
    // Reduce cost to 1 if it is a refinement on an already staged image
    if (isRefinement && !isFreePlan) {
      cost = 1;
    }

    return userProfile.credits < cost;
  }, [activeItem, userProfile]);

  // Set initial active ID
  useEffect(() => {
    if (!activeId && items.length > 0) {
      setActiveId(items[0].id);
    }
  }, [items, activeId]);



  // Handle Stripe Redirection Check via Query Params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('payment_status');

    if (statusParam === 'success') {
      setPaymentStatus('success');
      // Clean URL without reloading, staying on main page
      window.history.replaceState({}, '', '/');
    } else if (statusParam === 'failure') {
      setPaymentStatus('failure');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Auth Listener and Profile Sync
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (u) => {
      if (u) {
        if (u.emailVerified) {
          setUser(u);
          const profile = await getUserProfile(u.uid);
          setUserProfile(profile);
          setEditName(profile?.name || '');
          setShowVerificationScreen(false);
          setShowAuth(false);
          setShowFreeTrialPromo(false);
          const projects = await getUserProjects(u.uid);
          setUserProjects(projects);

          // Establish Stripe Sync Listener
          if (stripeUnsubRef.current) stripeUnsubRef.current();
          stripeUnsubRef.current = setupStripeSync(u.uid, (updatedProfile) => {
            if (updatedProfile.isDisabled) {
              logout();
              alert("Your account has been suspended by an administrator.");
            } else {
              setUserProfile(updatedProfile);
            }
          });
          
          // Check disability state initially and update last logic
          if (profile?.isDisabled) {
            logout();
            alert("Your account has been suspended by an administrator.");
          } else {
             updateLastLogin(u.uid, u.metadata.lastSignInTime);
          }
          
        } else {
          setVerificationEmail(u.email || '');
          setShowVerificationScreen(true);
          setUser(null);
          setUserProfile(null);
          if (stripeUnsubRef.current) stripeUnsubRef.current();
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setUserProjects([]);
        if (stripeUnsubRef.current) stripeUnsubRef.current();
      }
      setAuthLoading(false);
    });
    return () => {
      unsubscribe();
      if (stripeUnsubRef.current) stripeUnsubRef.current();
    };
  }, []);



  useEffect(() => {
    if (showMyProjects && user) {
      getUserProjects(user.uid).then(fetchedProjects => {
        setUserProjects(currentProjects => {
          // Merge fetched projects with optimistic local state to prevent thumbnails from flashing out
          const merged = fetchedProjects.map(fp => {
            const currentProj = currentProjects.find(cp => cp.id === fp.id);
            if (currentProj && currentProj.thumbnailUrl && !fp.thumbnailUrl) {
              return { ...fp, thumbnailUrl: currentProj.thumbnailUrl };
            }
            return fp;
          });
          
          // Inject any newly created projects that haven't synced from Firebase yet
          currentProjects.forEach(cp => {
            if (!merged.find(m => m.id === cp.id)) {
              merged.unshift(cp);
            }
          });
          
          return merged;
        });
      });
    }
  }, [showMyProjects, user]);

  const handleUpgradeSubscription = () => {
    setShowSubscriptionPlans(true);
    setShowProfileMenu(false);
  };

  const handleAddCredits = () => {
    setShowCreditPacks(true);
    setShowProfileMenu(false);
  };

  const selectSubscription = (type: 'basic_sub' | 'standard_sub' | 'premium_sub') => {
    setPaymentType(type);
    setShowSubscriptionPlans(false);
    setShowPaymentConfirm(true);
  };

  const handleFinalizePayment = async () => {
    if (!user || !paymentType) return;
    setIsUpgrading(true);
    try {
      const selectedPlan = PRICING[paymentType];
      // Send 'payment' mode for top-ups, 'subscription' for monthly plans
      const mode = paymentType.startsWith('top_up') ? 'payment' : 'subscription';
      const url = await createStripeCheckout(user.uid, selectedPlan.id, mode);
      console.log("Stripe Checkout Link Generated:", url);
      window.location.href = url;
    } catch (err: any) {
      console.error("Checkout flow failed:", err);
      // Suppress alert as requested by user
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    console.log("handleCancelSubscription: Clicked by user");
    
    if (!confirm("You will be redirected to the customer portal to manage or cancel your subscription. Continue?")) {
      console.log("handleCancelSubscription: User cancelled via confirm dialog");
      return;
    }

    console.log("handleCancelSubscription: User confirmed");
    setIsUpgrading(true);

    try {
      console.log("handleCancelSubscription: Calling createPortalLink...");
      const url = await createPortalLink();
      console.log(`handleCancelSubscription: Portal URL received: ${url}`);
      console.log("handleCancelSubscription: Redirecting user to portal URL immediately.");
      window.location.href = url;
    } catch (err: any) {
      console.error("handleCancelSubscription: Failed to get portal link", err);
      alert("Failed to load subscription management portal. Please try again.");
      setIsUpgrading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLoginView) {
        const loggedUser = await login(email, password);
        if (!loggedUser.emailVerified) {
          setVerificationEmail(loggedUser.email || '');
          setShowVerificationScreen(true);
          await logout();
        }
      } else {
        await register(email, password);
        setVerificationEmail(email);
        setShowVerificationScreen(true);
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus('idle');
    try {
      await resendVerificationEmail(email, password);
      setResendStatus('success');
    } catch (err: any) {
      setResendStatus('error');
      setAuthError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    try {
      const loggedUser = await loginWithGoogle();
      if (!loggedUser.emailVerified) {
        setVerificationEmail(loggedUser.email || '');
        setShowVerificationScreen(true);
        await logout();
      }
    } catch (err: any) {
      setAuthError(err.message || "Google Sign-In failed.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await resetPassword(email);
      setShowResetSuccess(true);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateUserProfile(user.uid, { name: editName });
      const updated = await getUserProfile(user.uid);
      setUserProfile(updated);
      setIsEditingProfile(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you absolutely sure? This will delete your account, your profile, and all your stored projects permanently.")) {
      try {
        const uid = user?.uid;
        await deleteUserAccount();
        if (uid) await deleteUserProfile(uid);
        setItems([]);
        setUser(null);
        setUserProfile(null);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    setIsEditingProfile(false);
    setShowVerificationScreen(false);
    setResendStatus('idle');
    setCurrentProjectId(null);
  };

  useEffect(() => {
    if (activeItem?.currentStyle && activeItem?.staged[activeItem.currentStyle]) {
      setViewMode('staged');
    } else {
      setViewMode('original');
    }
  }, [activeItem?.staged, activeItem?.currentStyle, activeId]);

  const processFiles = async (rawFiles: File[], updatedUserProjects: ProjectRecord[] = userProjects, projectId?: string, projectName?: string) => {
    const newUploadedItems: StagedItem[] = [];
    for (const file of rawFiles) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      const promise = new Promise<void>((resolve) => {
        reader.onloadend = () => {
          const newItem: StagedItem = {
            id: Math.random().toString(36).substr(2, 9),
            projectId: projectId || currentProjectId || undefined,
            name: file.name,
            original: reader.result as string,
            roomType: '',
            styleCategory: 'interior',
            staged: {},
            styleHistory: {},
            historyIndex: {},
            currentStyle: null,
            refinementPrompt: '',
            refinementHistory: [],
            isProcessing: false,
            error: null,
          };
          newUploadedItems.push(newItem);
          resolve();
        };
      });
      reader.readAsDataURL(file);
      await promise;

      // Upload to storage if user is signed in and a project is active
      if (user) {
        const pId = projectId || currentProjectId;
        const resolvedProjectName = projectName || updatedUserProjects.find(p => p.id === pId)?.name || userProjects.find(p => p.id === pId)?.name || 'Default Project';
        const base64Image = reader.result as string;
        
        // Eagerly update the thumbnail in React state with the local base64 so it shows instantly!
        setUserProjects(prevProjects => prevProjects.map(proj => 
          proj.id === pId && !proj.thumbnailUrl ? { ...proj, thumbnailUrl: base64Image } : proj
        ));
        
        console.log("processFiles is about to trigger upload for pId:", pId, "and resolvedName:", resolvedProjectName);

        uploadBase64ToStorage(user.uid, base64Image, file.name, resolvedProjectName).then(async (originalUrlStorage) => {
          console.log("Upload succeeded, saving file record with pId:", pId);
          await saveFileRecord(user.uid, {
            projectId: pId,
            fileName: file.name,
            originalUrl: originalUrlStorage,
          });
          
          setItems(prev => prev.map(i => i.id === newUploadedItems[newUploadedItems.length - 1].id ? { ...i, originalUrlStorage } : i));
        }).catch(err => {
          console.error("Failed to upload original image to storage:", err);
        });
      }
    }
    
    if (newUploadedItems.length > 0) {
      setItems(prev => [...newUploadedItems, ...prev]);
      setActiveId(newUploadedItems[0].id);
    }
  };

  const handleFiles = async (rawFiles: File[]) => {
    if (rawFiles.length === 0) return;

    if (user) {
      setPendingFiles(rawFiles);
      setShowProjectModal(true);
    } else {
      processFiles(rawFiles);
    }
  };

  const handleConfirmProject = async (create: boolean) => {
    let pId = currentProjectId;
    let createdProjectName: string | undefined = undefined;
    let updatedProjects = [...userProjects]; // Track the latest array for processFiles
    if (create && newProjectName.trim()) {
      setIsCreatingProject(true);
      try {
        createdProjectName = newProjectName.trim();
        pId = await createProject(user.uid, createdProjectName);
        
        // Optimistic UI Update: Instead of fetching from DB (which might hide it due to pending timestamp),
        // we manually inject the new project at the top of the array.
        const newProject: ProjectRecord = {
          id: pId,
          name: createdProjectName,
          createdAt: { toDate: () => new Date() } 
        };
        updatedProjects = [newProject, ...userProjects];
        setUserProjects(updatedProjects);
        setCurrentProjectId(pId);
      } catch (err) {
        console.error("Failed to create project:", err);
      } finally {
        setIsCreatingProject(false);
      }
    }
    
    console.log("handleConfirmProject sending pId to processFiles:", pId);
    console.log("handleConfirmProject currentProjectId is:", currentProjectId);

    // Pass the newly fetched projects to processFiles so it's not using stale closure data
    processFiles(pendingFiles, updatedProjects, pId || undefined, createdProjectName);
    setShowProjectModal(false);
    setPendingFiles([]);
    setNewProjectName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []) as File[];
    handleFiles(rawFiles);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    handleFiles(droppedFiles);
  };

  // Improved urlToBase64 with verification and robust fetch
  const urlToBase64 = async (url: string): Promise<string> => {
    if (!url) throw new Error("Invalid URL provided for conversion.");
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert image to data URL."));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err: any) {
      console.error("Conversion failed for URL:", url, err);
      throw new Error(`Failed to fetch and process the image. This may be due to network issues or CORS restrictions. Original error: ${err.message}`);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    setIsImporting(true);
    setLoadingProjectId(projectId);
    setLoadingProjectProgress(0);
    try {
      if (!user) {
        alert("You must be logged in to load a project.");
        return;
      }
      
      if (projectId === currentProjectId && items.length > 0) {
        // The user clicked the project they are currently viewing!
        // Prevent reloading to avoid wiping their un-saved local base64 files while they upload!
        setShowMyProjects(false);
        setIsImporting(false);
        return;
      }
      
      // Fetch the latest files for the user to ensure we have the project data
      const latestFiles = await getUserFiles(user.uid);
      
      console.log("Loading Project ID:", projectId);
      console.log("Total Files found for user:", latestFiles.length);
      console.log("All File Project IDs mapped:", latestFiles.map(f => ({ id: f.id, pId: f.projectId, fileName: f.fileName })));

      const projectFiles = latestFiles.filter(f => f.projectId === projectId);
      if (projectFiles.length === 0) {
        alert(`No files found in this project! Found ${latestFiles.length} total files, but none match ID: ${projectId}. Check Dev Console.`);
        setIsImporting(false);
        return;
      }

      const newItems: StagedItem[] = [];
      const groupedFiles = new Map<string, typeof projectFiles>();
      
      for (const file of projectFiles) {
        if (!file.originalUrl) continue;
        if (!groupedFiles.has(file.originalUrl)) {
          groupedFiles.set(file.originalUrl, []);
        }
        groupedFiles.get(file.originalUrl)!.push(file);
      }
      let processedCount = 0;
      const totalGroups = groupedFiles.size;

      for (const [originalUrl, files] of groupedFiles.entries()) {
        processedCount++;
        setLoadingProjectProgress(Math.round((processedCount / totalGroups) * 100));
        
        const baseFile = files[0];
        
        let originalBase64 = originalUrl;
        try {
          // Attempt to convert URL to base64 so it can be used for generation
          if (originalUrl.startsWith('http')) {
            originalBase64 = await urlToBase64(originalUrl);
          }
        } catch (err) {
          console.warn("Failed to convert originalUrl to base64, using URL instead. Generation may fail.", err);
        }

        const item: StagedItem = {
          id: Math.random().toString(36).substr(2, 9),
          projectId: baseFile.projectId,
          name: baseFile.fileName,
          original: originalBase64,
          originalUrlStorage: originalUrl,
          roomType: (baseFile.roomType as RoomType) || '',
          styleCategory: 'interior',
          staged: {},
          styleHistory: {},
          historyIndex: {},
          currentStyle: null,
          refinementPrompt: '',
          refinementHistory: [],
          isProcessing: false,
          error: null,
        };

        // Sort files by timestamp ascending so history is built correctly
        const sortedFiles = [...files].sort((a, b) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
          return timeA - timeB;
        });

        for (const file of sortedFiles) {
          const styleId = file.style as StagingStyle | undefined;
          if (styleId && file.stagedUrl) {
            const historyItem: HistoryItem = {
              id: Math.random().toString(36).substr(2, 9),
              url: file.stagedUrl,
              prompt: file.prompt || 'Imported Stage',
              timestamp: file.timestamp?.toMillis ? file.timestamp.toMillis() : Date.now()
            };
            
            if (!item.styleHistory[styleId]) {
              item.styleHistory[styleId] = [];
            }
            item.styleHistory[styleId].push(historyItem);
            item.staged[styleId] = file.stagedUrl;
            item.historyIndex[styleId] = item.styleHistory[styleId].length - 1;
            item.currentStyle = styleId;
            item.styleCategory = OUTDOOR_STYLES.some(s => s.id === styleId) ? 'outdoor' : 'interior';
            if (file.roomType) item.roomType = file.roomType as RoomType;
          }
        }
        newItems.push(item);
      }

      setItems(newItems);
      if (newItems.length > 0) {
        setActiveId(newItems[0].id);
      }
      setCurrentProjectId(projectId);
      setShowMyProjects(false);
    } catch (err: any) {
      console.error("Failed to load project:", err);
      alert("Failed to load project.");
    } finally {
      setIsImporting(false);
      setLoadingProjectId(null);
      setLoadingProjectProgress(0);
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (confirm("Are you sure you want to delete this project? This will also delete all files within it and cannot be undone.")) {
      try {
        const success = await deleteProject(user.uid, projectId);
        if (success) {
          setUserProjects(prev => prev.filter(p => p.id !== projectId));
          if (currentProjectId === projectId) {
             setCurrentProjectId(null);
             setItems([]);
          }
        } else {
           alert("Failed to delete project.");
        }
      } catch (err) {
        console.error("Error deleting project:", err);
      }
    }
  };

  const handleGenerateSelection = async () => {
    // Require login and credits
    if (!user || !userProfile || userProfile.credits <= 0) {
      setShowProfileMenu(true);
      return;
    }

    // Specific check for selected style cost vs remaining balance
    if (hasInsufficientCredits) {
      setShowProfileMenu(true);
      return;
    }

    const targets = selectedIds.size > 0 ? Array.from(selectedIds) : (activeId ? [activeId] : []);
    if (targets.length === 0) return;

    for (const id of targets) {
      const itemIndex = items.findIndex(i => i.id === id);
      const item = items[itemIndex];
      if (!item || item.isProcessing || !item.currentStyle) continue;

      const styleId = item.currentStyle;
      const history = item.styleHistory[styleId] || [];
      const currentIndex = item.historyIndex[styleId] ?? -1;
      
      const hasStagedImage = currentIndex >= 0 && history[currentIndex];
      const isRefinement = hasStagedImage && !!(item.refinementPrompt && item.refinementPrompt.trim().length > 0);
      
      const sourceImage = isRefinement ? history[currentIndex].url : item.original;

      const selectedStyleObj = ALL_STYLES.find(s => s.id === styleId);
      // FREE TRIAL LOGIC: Force 1 credit cost if plan is 'free'
      const isFreePlan = userProfile?.plan === 'free';
      
      let creditCost = isFreePlan ? 1 : (selectedStyleObj?.creditCost || 1);
      // Reduced cost for refinement
      if (isRefinement && !isFreePlan) {
        creditCost = 1;
      }

      if (user && userProfile && userProfile.credits < creditCost) {
        setShowProfileMenu(true);
        continue;
      }

      setItems(prev => {
        const next = [...prev];
        const idx = next.findIndex(i => i.id === id);
        if (idx !== -1) next[idx] = { ...next[idx], isProcessing: true, error: null };
        return next;
      });

      try {
        const stagedUrl = await stageRoom(sourceImage, styleId, item.roomType, item.refinementPrompt, isRefinement);
        
        if (user) {
          const newCreditBalance = await deductCredit(user.uid, creditCost);
          if (newCreditBalance !== null) {
            setUserProfile(prev => prev ? { ...prev, credits: newCreditBalance } : null);
            // Auto-open menu if we hit zero credits
            if (newCreditBalance === 0) {
              setShowProfileMenu(true);
            }
          }

          (async () => {
            try {
              const originalFileName = item.name;
              const stagedFileName = `${item.name.substring(0, item.name.lastIndexOf('.')) || item.name}_staged.jpg`;
              const projectName = userProjects.find(p => p.id === item.projectId)?.name;
              
              let originalUrlStorage = item.originalUrlStorage;
              if (!originalUrlStorage) {
                originalUrlStorage = await uploadBase64ToStorage(user.uid, item.original, originalFileName, projectName);
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, originalUrlStorage } : i));
              }
              
              const stagedUrlStorage = await uploadBase64ToStorage(user.uid, stagedUrl, stagedFileName, projectName);
              
              await saveFileRecord(user.uid, {
                projectId: item.projectId,
                fileName: item.name,
                originalUrl: originalUrlStorage,
                stagedUrl: stagedUrlStorage,
                style: styleId,
                roomType: item.roomType,
                prompt: item.refinementPrompt || ALL_STYLES.find(s => s.id === styleId)?.label || 'Staged'
              });
            } catch (err) {
              console.error("Failed to sync generation to Firebase:", err);
            }
          })();
        }

        setItems(prev => {
          const next = [...prev];
          const idx = next.findIndex(i => i.id === id);
          if (idx !== -1) {
            const currentItem = next[idx];
            const currentHistory = currentItem.styleHistory[styleId] || [];
            const currentIdx = currentItem.historyIndex[styleId] ?? -1;
            const newHistoryStack = currentHistory.slice(0, currentIdx + 1);
            const newHistoryItem: HistoryItem = {
              id: Math.random().toString(36).substr(2, 9),
              url: stagedUrl,
              prompt: item.refinementPrompt || ALL_STYLES.find(s => s.id === styleId)?.label || 'Staged',
              timestamp: Date.now()
            };
            const updatedHistory = [...newHistoryStack, newHistoryItem];
            const newIdx = updatedHistory.length - 1;

            next[idx] = {
              ...currentItem,
              staged: { ...currentItem.staged, [styleId]: stagedUrl },
              styleHistory: { ...currentItem.styleHistory, [styleId]: updatedHistory },
              historyIndex: { ...currentItem.historyIndex, [styleId]: newIdx },
              refinementPrompt: '',
              isProcessing: false,
              error: null
            };
          }
          return next;
        });
      } catch (err: any) {
        setItems(prev => {
          const next = [...prev];
          const idx = next.findIndex(i => i.id === id);
          if (idx !== -1) {
            next[idx] = {
              ...next[idx],
              isProcessing: false,
              error: err?.message || "Generation failed."
            };
          }
          return next;
        });
      }
    }
  };

  const handleUndo = () => {
    if (!activeItem || !activeItem.currentStyle) return;
    const styleId = activeItem.currentStyle;
    const currentIdx = activeItem.historyIndex[styleId] ?? -1;
    if (currentIdx > 0) {
      setItems(prev => {
        const next = [...prev];
        const idx = next.findIndex(i => i.id === activeId);
        if (idx !== -1) {
          const newIdx = currentIdx - 1;
          const history = next[idx].styleHistory[styleId];
          next[idx] = {
            ...next[idx],
            historyIndex: { ...next[idx].historyIndex, [styleId]: newIdx },
            staged: { ...next[idx].staged, [styleId]: history[newIdx].url }
          };
        }
        return next;
      });
    }
  };

  const handleRedo = () => {
    if (!activeItem || !activeItem.currentStyle) return;
    const styleId = activeItem.currentStyle;
    const currentIdx = activeItem.historyIndex[styleId] ?? -1;
    const history = activeItem.styleHistory[styleId] || [];
    if (currentIdx < history.length - 1) {
      setItems(prev => {
        const next = [...prev];
        const idx = next.findIndex(i => i.id === activeId);
        if (idx !== -1) {
          const newIdx = currentIdx + 1;
          next[idx] = {
            ...next[idx],
            historyIndex: { ...next[idx].historyIndex, [styleId]: newIdx },
            staged: { ...next[idx].staged, [styleId]: history[newIdx].url }
          };
        }
        return next;
      });
    }
  };

  const handleJumpToHistory = (historyIdx: number) => {
    if (!activeItem || !activeItem.currentStyle) return;
    const styleId = activeItem.currentStyle;
    setItems(prev => {
      const next = [...prev];
      const idx = next.findIndex(i => i.id === activeId);
      if (idx !== -1) {
        const history = next[idx].styleHistory[styleId];
        next[idx] = {
          ...next[idx],
          historyIndex: { ...next[idx].historyIndex, [styleId]: historyIdx },
          staged: { ...next[idx].staged, [styleId]: history[historyIdx].url }
        };
      }
      return next;
    });
  };

  const handleDeleteRefinement = (index: number) => {
    if (!activeId || !activeItem?.currentStyle) return;
    const styleId = activeItem.currentStyle;
    
    setItems(prev => {
      const next = [...prev];
      const idx = next.findIndex(i => i.id === activeId);
      if (idx === -1) return next;

      const item = next[idx];
      const history = item.styleHistory[styleId] || [];
      const currentIdx = item.historyIndex[styleId] ?? -1;
      const newHistory = history.filter((_, i) => i !== index);
      
      let newIdx = currentIdx;
      if (index < currentIdx) {
        newIdx = currentIdx - 1;
      } else if (index === currentIdx) {
        newIdx = Math.max(0, currentIdx - 1);
      }
      
      if (newHistory.length === 0) {
        newIdx = -1;
      }

      const stagedUrl = newIdx >= 0 ? newHistory[newIdx].url : (item.staged[styleId] || null);
      const finalStagedUrl = newHistory.length === 0 ? null : stagedUrl;

      next[idx] = {
        ...item,
        styleHistory: { ...item.styleHistory, [styleId]: newHistory },
        historyIndex: { ...item.historyIndex, [styleId]: newIdx },
        staged: { ...item.staged, [styleId]: finalStagedUrl }
      };
      
      return next;
    });
  };

  const handleDownloadStaged = () => {
    const hasStaged = items.some(item => 
        (item.currentStyle && item.staged[item.currentStyle]) || 
        Object.keys(item.styleHistory).some(key => item.styleHistory[key]?.length > 0)
    );
    if (!hasStaged) {
      alert("No staged images available to download in this project.");
      return;
    }
    setDownloadType('staged');
    setShowDownloadModal(true);
  };

  const handleDownloadOriginals = () => {
    if (items.length === 0) return;
    setDownloadType('original');
    setShowDownloadModal(true);
  };

  const handleDownloadSingle = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSingleDownloadItemId(itemId);
    setDownloadType('single');
    setShowDownloadModal(true);
  };

  const confirmDownload = async () => {
    setIsDownloading(true);
    try {
      if (downloadType === 'single' && singleDownloadItemId) {
        const item = items.find((i: StagedItem) => i.id === singleDownloadItemId);
        if (!item) {
          alert("Image not found."); setIsDownloading(false); return;
        }
        
        const url = (item.currentStyle && item.staged[item.currentStyle]) || item.original;
        
        if (downloadResolution === '4K') {
          if (userProfile && userProfile.credits < 1) {
            alert(`Insufficient credits. You need 1 credit for this 4K download.`);
            setIsDownloading(false);
            return;
          }
        }
        
        let preProcessedUrl = url;
        if (downloadResolution === '4K') {
           preProcessedUrl = await upscaleImage(url);
        }
        const maxDim = downloadResolution === '4K' ? 4096 : 2560;
        const processedDataUrl = await resizeAndFormatImage(
          preProcessedUrl, 
          maxDim, 
          300, 
          item.watermarkText || undefined
        );
        
        if (downloadResolution === '4K' && user) {
          await deductCredit(user.uid, 1);
        }
        
        const link = document.createElement('a');
        link.href = processedDataUrl;
        link.download = `our_digital_dwelling_${downloadResolution}_${item.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsDownloading(false);
        setShowDownloadModal(false);
        return;
      }

      const zip = new JSZip();

      if (downloadType === 'original') {
        let count = 0;
        for (const item of items) {
           const originalBaseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
           const fileName = `${originalBaseName}_original.jpg`;
           try {
             const maxDim = downloadResolution === '4K' ? 4096 : 2560;
             const processedDataUrl = await resizeAndFormatImage(item.original, maxDim, 300);
             const base64Data = processedDataUrl.split(',')[1];
             if (base64Data) {
               zip.file(fileName, base64Data, { base64: true });
               count++;
             }
           } catch(e) {}
        }
        if (count === 0) {
           alert("No original images found."); setIsDownloading(false); return;
        }
      } else {
        const exportQueue: { name: string, url: string, watermarkText?: string, is4kAI: boolean }[] = [];
        
        for (const item of items) {
            const originalBaseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
            const uniqueUrls = new Set<string>();
            const addUrl = (url: string, suffix: string, watermarkText?: string) => {
                if (uniqueUrls.has(url)) return;
                uniqueUrls.add(url);
                exportQueue.push({
                   name: `${originalBaseName}_${suffix}.jpg`,
                   url: url,
                   watermarkText: watermarkText,
                   is4kAI: true 
                });
            };
            
            for (const [styleId, url] of Object.entries(item.staged)) {
               if (url) addUrl(url, `staged_${styleId}`, item.watermarkText);
            }
            
            for (const [styleId, historyArray] of Object.entries(item.styleHistory)) {
               historyArray.forEach((histItem, idx) => {
                  addUrl(histItem.url, `staged_${styleId}_v${idx+1}`, item.watermarkText);
               });
            }
        }
        
        const totalCost = downloadResolution === '4K' ? exportQueue.length : 0;
        if (totalCost > 0 && userProfile && userProfile.credits < totalCost) {
            alert(`Insufficient credits. You need ${totalCost} credits for this 4K download.`);
            setIsDownloading(false);
            return;
        }
        
        for (const queued of exportQueue) {
            try {
                let preProcessedUrl = queued.url;
                if (downloadResolution === '4K' && queued.is4kAI) {
                   preProcessedUrl = await upscaleImage(queued.url);
                }
                const maxDim = downloadResolution === '4K' ? 4096 : 2560;
                const processedDataUrl = await resizeAndFormatImage(
                  preProcessedUrl, 
                  maxDim, 
                  300, 
                  queued.watermarkText || undefined
                );
                const base64Data = processedDataUrl.split(',')[1];
                if (base64Data) {
                  zip.file(queued.name, base64Data, { base64: true });
                }
            } catch (err) {}
        }
        
        if (exportQueue.length === 0) {
           alert("No staged images found."); setIsDownloading(false); return;
        }
        
        if (totalCost > 0 && userProfile) {
            await deductCredit(userProfile.uid, totalCost);
            setUserProfile(prev => prev ? { ...prev, credits: prev.credits - totalCost } : null);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `our_digital_dwelling_${downloadType}_photos_${Date.now()}.zip`;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
      alert("An error occurred during download. Please try again.");
    } finally {
      setIsDownloading(false);
      setShowDownloadModal(false);
    }
  };

  const handleSetStyleForSelection = (styleId: StagingStyle) => {
    const targets = selectedIds.size > 0 ? Array.from(selectedIds) : (activeId ? [activeId] : []);
    setItems(prev => {
      const next = [...prev];
      targets.forEach(id => {
        const idx = next.findIndex(i => i.id === id);
        if (idx !== -1) {
          const item = next[idx];
          const history = item.styleHistory[styleId] || [];
          const hIdx = item.historyIndex[styleId] ?? -1;
          const stagedImage = hIdx >= 0 ? history[hIdx].url : (item.staged[styleId] || null);

          next[idx] = { 
            ...item, 
            currentStyle: styleId,
            staged: { ...item.staged, [styleId]: stagedImage }
          };
        }
      });
      return next;
    });
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Delete this photo?")) {
      const nextItems = items.filter(item => item.id !== id);
      setItems(nextItems);
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (activeId === id) {
        setActiveId(nextItems[0]?.id || null);
      }
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} selected photo(s)?`)) {
      const nextItems = items.filter(item => !selectedIds.has(item.id));
      setItems(nextItems);
      if (nextItems.length === 0) {
        setActiveId(null);
      } else if (activeId && selectedIds.has(activeId)) {
        setActiveId(nextItems[0]?.id || null);
      }
      setSelectedIds(new Set());
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all photos from this project? This will return you to the upload screen.")) {
      setItems([]);
      setActiveId(null);
      setSelectedIds(new Set());
      setCurrentProjectId(null);
    }
  };

  const currentImage = useMemo(() => {
    if (!activeItem) return '';
    if (viewMode === 'original') return activeItem.original;
    const styleId = activeItem.currentStyle;
    if (!styleId) return activeItem.original;
    
    const history = activeItem.styleHistory[styleId] || [];
    const hIdx = activeItem.historyIndex[styleId] ?? -1;
    if (hIdx >= 0 && history[hIdx]) return history[hIdx].url;
    
    return activeItem.staged[styleId] || activeItem.original;
  }, [activeItem, viewMode]);

  const activeStyleHistory = useMemo(() => {
    if (!activeItem || !activeItem.currentStyle) return [];
    return activeItem.styleHistory[activeItem.currentStyle] || [];
  }, [activeItem]);

  const activeHistoryIdx = useMemo(() => {
    if (!activeItem || !activeItem.currentStyle) return -1;
    return activeItem.historyIndex[activeItem.currentStyle] ?? -1;
  }, [activeItem]);

  const handleCategorySwitch = (category: StyleCategory) => {
    if (!activeId) return;
    setItems(prev => {
      const next = [...prev];
      const idx = next.findIndex(i => i.id === activeId);
      if (idx !== -1) {
        const item = next[idx];
        let newStyle = item.currentStyle;
        if (category === 'interior' && !INTERIOR_STYLES.some(s => s.id === newStyle)) {
          newStyle = null;
        } else if (category === 'outdoor' && !OUTDOOR_STYLES.some(s => s.id === newStyle)) {
          newStyle = null;
        }
        next[idx] = { ...item, styleCategory: category, currentStyle: newStyle, roomType: '' as RoomType };
      }
      return next;
    });
  };

  const handleSaveVersion = useCallback(() => {
    if (!activeItem || viewMode === 'original' || !currentImage) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const newItem: StagedItem = {
      id: newId,
      projectId: activeItem.projectId,
      name: `v2_${activeItem.name}`,
      original: currentImage,
      roomType: activeItem.roomType,
      styleCategory: activeItem.styleCategory,
      staged: {},
      styleHistory: {},
      historyIndex: {},
      currentStyle: null,
      refinementPrompt: '',
      refinementHistory: [],
      isProcessing: false,
      error: null,
    };
    setItems(prev => {
      const originalIndex = prev.findIndex(item => item.id === activeId);
      if (originalIndex === -1) return [newItem, ...prev];
      const newItems = [...prev];
      newItems.splice(originalIndex + 1, 0, newItem);
      return newItems;
    });
    setActiveId(newId);
    setViewMode('original');
  }, [activeItem, activeId, viewMode, currentImage, setItems]);

  const isOutOfCredits = useMemo(() => {
    return userProfile !== null && userProfile.credits <= 0;
  }, [userProfile]);

  const isLowCredits = useMemo(() => {
    return userProfile !== null && userProfile.credits > 0 && userProfile.credits <= 5;
  }, [userProfile]);

  const isMediumCredits = useMemo(() => {
    return userProfile !== null && userProfile.credits > 5 && userProfile.credits <= 10;
  }, [userProfile]);



  if (authLoading || !isStorageReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- FREE TRIAL PROMO VIEW ---
  if (showFreeTrialPromo && !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-x-hidden relative transition-colors">
        <header className="fixed top-0 left-0 right-0 z-[60] bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowFreeTrialPromo(false)}>
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span className="text-xl font-black tracking-tight uppercase">Our Digital <span className="text-indigo-600 dark:text-indigo-400">Dwelling</span></span>
          </div>
          <button onClick={() => { setShowFreeTrialPromo(false); setShowAuth(false); }} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Back to Site</button>
        </header>

        <main className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 mb-2">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Limited Time Offer</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-[1.1] text-slate-900 dark:text-white">Start Your <span className="text-indigo-600 dark:text-indigo-400">10-Credit</span> <br/>Free Trial Today.</h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">Experience the full power of professional virtual staging. No credit card required to start your first project.</p>
              <div className="pt-4 flex flex-col items-center">
                 <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-6 text-center max-w-2xl px-6">
                   During your FREE TRIAL all features are available and use 1 credit so you can try them all! Please be aware during subscription service, features can cost 1 to 5 credits depending on style.
                 </p>
                 <button onClick={() => { setShowAuth(true); setIsLoginView(false); setShowFreeTrialPromo(false); }} className="bg-indigo-600 dark:bg-[#4adb17] text-white px-10 py-5 rounded-[2rem] text-lg font-black shadow-2xl shadow-indigo-600/30 dark:shadow-[#4adb17]/30 hover:scale-[1.02] hover:bg-indigo-500 dark:hover:bg-[#3cae12] transition-all">Sign Up & Claim Credits</button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: 'Interior Staging', 
                  desc: 'Transform empty rooms with high-end furniture.', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 v4a1 1 0 001 1m-6 0h6"></path></svg>,
                  img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=600'
                },
                { 
                  title: 'Lawn & Sky', 
                  desc: 'Replace gray skies and brown grass instantly.', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path></svg>,
                  img: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&q=80&w=600'
                },
                { 
                  title: 'Item Removal', 
                  desc: 'Digitally de-clutter any room or exterior area.', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>,
                  img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600'
                },
                { 
                  title: 'Twilight Conversion', 
                  desc: 'Daytime shots into stunning twilight images.', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>,
                  img: 'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?auto=format&fit=crop&q=80&w=600'
                },
                { 
                  title: 'Season Transform', 
                  desc: 'Change foliage from winter snow to spring.', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>,
                  img: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=600'
                },
                { 
                  title: 'AI Refinement', 
                  desc: 'Fine-tune results with custom AI prompts.', 
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>,
                  img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'
                },
              ].map((service, idx) => (
                <div key={idx} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none p-4 flex flex-col space-y-3 hover:-translate-y-1 transition-all">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-1">
                    <img src={service.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={service.title} />
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 w-10 h-10 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                    {service.icon}
                  </div>
                  <h3 className="text-base font-black truncate text-slate-900 dark:text-white">{service.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed flex-1">{service.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 p-8 rounded-[2rem] bg-slate-900 text-white flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-2xl font-black">Ready to elevate your listings?</h2>
                <p className="text-slate-400 text-sm">Join over 2,000 agents already using Our Digital Dwelling.</p>
              </div>
              <button onClick={() => { setShowAuth(true); setIsLoginView(false); setShowFreeTrialPromo(false); }} className="bg-indigo-600 dark:bg-[#4adb17] text-white px-8 py-4 rounded-2xl text-base font-black shadow-xl shadow-indigo-600/30 dark:shadow-[#4adb17]/30 hover:bg-indigo-500 dark:hover:bg-[#3cae12] transition-all shrink-0">Claim 10 Credits Free</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ... (Login/Auth views) ...
  if (!user && !showAuth && !showVerificationScreen && !showResetSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-x-hidden relative transition-colors">
        <header className="fixed top-0 left-0 right-0 z-[60] bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span className="text-xl font-black tracking-tight uppercase">Our Digital <span className="text-indigo-600 dark:text-indigo-400">Dwelling</span></span>
          </div>

          {/* TOP CENTER BUTTON */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
            <button onClick={() => setShowFreeTrialPromo(true)} className="bg-indigo-600 dark:bg-[#4adb17] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 dark:shadow-[#4adb17]/20 hover:scale-105 hover:bg-indigo-500 dark:hover:bg-[#3cae12] transition-all">Start your FREE Trial Today!</button>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="Toggle Dark Mode">
               {isDarkMode ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>}
             </button>
             <button onClick={() => setShowAuth(true)} className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-lg shadow-slate-900/10">Sign In</button>
          </div>
        </header>

        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1]">
                Our Digital Dwelling
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                Can handle the most common Realtor® requested photo fixes for you - no special computer or editing skills required!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {[
                  "Declutter room, counter, shelves",
                  "Empty room completely",
                  "Green grass/cut grass",
                  "Blue sky",
                  "Season change",
                  "Make cloudy day look sunny",
                  "Add fire in fireplace",
                  "Remove an item from photo",
                  "Add staging prop like flowers, fruit bowl, wall art",
                  "Change room, rug or furniture color",
                  "Stage a room with a style of your choice",
                  "Daytime to twilight photo conversion"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-full text-indigo-600 dark:text-indigo-400 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-snug">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 mt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex gap-3 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">Works on your smartphone, tablet or computer, high quality image ready in seconds for download!</p>
                </div>
                <button onClick={() => setShowFreeTrialPromo(true)} className="w-full bg-indigo-600 dark:bg-[#4adb17] text-white px-8 py-4 rounded-2xl text-lg font-black shadow-xl shadow-indigo-600/20 dark:shadow-[#4adb17]/20 hover:scale-[1.02] hover:bg-indigo-500 dark:hover:bg-[#3cae12] transition-all uppercase tracking-wide">Sign up for our FREE TRIAL</button>
              </div>
            </div>
            <div className="flex-1 relative w-full flex flex-col items-center">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">NEXT-GEN PHOTO RETOUCHING AND VIRTUAL STAGING</span>
              </div>
              <div className="relative w-full">
                <div className="absolute -inset-4 bg-indigo-600/5 dark:bg-indigo-400/5 blur-3xl rounded-[3rem]"></div>
                <div className="relative bg-slate-100 dark:bg-slate-800 rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-[3/4] xl:aspect-[4/3]">
                  <img src={landingTwilight} className="w-full h-full object-cover" alt="Twilight Exterior Conversion" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="text-white">
                    <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Twilight Conversion</p>
                    <p className="text-xl font-bold">Virtual Staging Applied</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/30 text-white text-xs font-bold">Generated in 4s</div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50 dark:bg-slate-900/50 px-6 transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Professional Services</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Skip the movers. Skip the rent. Skip the wait. Get photorealistic results for a fraction of the cost.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ... (Existing service cards) ... */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-10 overflow-hidden transition-colors">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">Most Popular</span>
                  <h3 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Interior Virtual Staging</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8">Transform empty spaces into beautifully furnished rooms. Choose from Modern, Luxury, Scandinavian, or Rustic styles tailored to your property.</p>
                  <ul className="space-y-4">
                    {['Furniture Placement', 'Lighting Optimization', 'High-End Decor Selection'].map(item => (
                      <li key={item} className="flex items-center gap-3 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-md">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-full md:w-1/2 aspect-square rounded-3xl overflow-hidden shadow-2xl shrink-0 group/img">
                  <img src={interiorStagingImg} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" alt="Interior Staging Before and After" />
                </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19a3.5 3.5 0 0 0 0-7c-.3 0-.6 0-.9.1a5 5 0 0 0-9.8 1.4c0 .5.1 1 .2 1.5a3.5 3.5 0 0 0 0 7z"/></svg>
                  </div>
                  <h3 className="text-2xl font-black">Sky & Lawn Retouching</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Turn gray skies into blue, and brown lawns into lush green manicured landscapes. Instant curb appeal for any weather.</p>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest">Exterior Excellence</p>
                </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </div>
                  <h3 className="text-2xl font-black">Digital Item Removal</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Instantly de-clutter rooms by removing old furniture, boxes, and personal items. Show the space's full potential.</p>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest opacity-40">Clean Slate Technology</p>
                </div>
              </div>

              <div className="md:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-10 transition-colors">
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Day-to-Dusk Twilight</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Convert daytime exterior photos into stunning twilight images. Add golden hour skies and a warm interior glow to windows for that luxury premium look.</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-md">Luxury Real Estate</span>
                    <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-md">High-End Ambiance</span>
                  </div>
                </div>
                <div className="w-full md:w-[45%] aspect-[4/3] rounded-3xl overflow-hidden shadow-lg shrink-0">
                  <img src="https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Twilight Real Estate" />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[2.5rem] shadow-inner border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-colors">
                <div className="space-y-4">
                   <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="M18.4 4.6a9 9 0 1 1-12.8 0"/></svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Virtual Renovation</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Help buyers visualize upgrades. Change wall colors, replace outdated flooring, or update kitchen counters with a few clicks.</p>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Custom Transformation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-20 px-6 border-t border-slate-100 dark:border-slate-800 text-center transition-colors">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex items-center justify-center gap-2">
              <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <span className="text-xl font-black tracking-tight uppercase text-slate-900 dark:text-white">Our Digital <span className="text-indigo-600 dark:text-indigo-400">Dwelling</span></span>
            </div>
            <div className="space-y-4">
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                © 2025 Our Digital Dwelling Inc.
                <span className="mx-3 text-slate-200 dark:text-slate-700">|</span>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-400/80 dark:text-indigo-500/80">Professional Grade Virtual Staging</span>
              </p>
              <div className="text-slate-400 dark:text-slate-500 text-sm flex flex-wrap items-center justify-center gap-4">
                <button onClick={() => setShowUserGuide(true)} className="hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors">User Guide</button>
                <button onClick={() => setShowTerms(true)} className="hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors">Terms of Service</button>
                <button onClick={() => setShowRefundPolicy(true)} className="hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors">Refund Policy</button>
                <button onClick={() => setShowContactUs(true)} className="hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors">Contact Us</button>
              </div>
            </div>
          </div>
        </footer>

        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-[100]">
          <a href="https://instagram.com/ourdigitaldwelling" target="_blank" rel="noopener noreferrer" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3.5 rounded-full shadow-2xl border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform text-pink-600 dark:text-pink-400" title="Follow @ourdigitaldwelling on Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a href="https://www.facebook.com/share/g/1WuHB7Kb3S/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3.5 rounded-full shadow-2xl border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform text-blue-600 dark:text-blue-400" title="Join our Facebook Community">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
        </div>
        {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}
        {showRefundPolicy && <RefundPolicy onClose={() => setShowRefundPolicy(false)} />}
        {showContactUs && <ContactUs onClose={() => setShowContactUs(false)} />}
        {showUserGuide && <UserGuide onClose={() => setShowUserGuide(false)} />}
      </div>
    );
  }

  // ... (Verification Screen, Reset Success, Key Selection) ...
  if (showVerificationScreen) {
    // ...
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-md dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/30 dark:border-slate-800">
          <div className="bg-amber-500 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-4">Verify Your Email</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">Sent to <span className="font-bold text-indigo-600 dark:text-indigo-400">{verificationEmail}</span>.</p>
          <div className="space-y-3">
            <button onClick={() => { setShowVerificationScreen(false); setIsLoginView(true); setShowAuth(true); }} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl">Back to Login</button>
            <button onClick={handleResend} disabled={isResending} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-2xl">{isResending ? 'Sending...' : 'Resend Email'}</button>
            {resendStatus === 'success' && <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">Sent!</p>}
          </div>
        </div>
      </div>
    );
  }

  if (showResetSuccess) {
    // ...
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-md dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-white/30 dark:border-slate-800">
          <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-4">Reset Link Sent</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">Check your email <span className="font-bold text-indigo-600 dark:text-indigo-400">{email}</span>.</p>
          <button onClick={() => { setShowResetSuccess(false); setIsForgotPasswordView(false); setIsLoginView(true); setShowAuth(true); }} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl">Sign In</button>
        </div>
      </div>
    );
  }

  if (!user && showAuth) {
    // ...
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-md dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-white/30 dark:border-slate-800">
          <div className="text-center mb-10">
            <div onClick={() => setShowAuth(false)} className="cursor-pointer bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Our Digital <span className="text-indigo-600 dark:text-indigo-400">Dwelling</span></h1>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">Professional Access Portal</p>
          </div>
          {isForgotPasswordView ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white" placeholder="Email Address" />
              <button className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20">Get Reset Link</button>
              <button type="button" onClick={() => setIsForgotPasswordView(false)} className="w-full text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-300 transition-colors">Back</button>
            </form>
          ) : (
            <>
              <button onClick={handleGoogleAuth} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl shadow-sm mb-6 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <i className="devicon-google-plain colored text-xl"></i>
                Continue with Google
              </button>
              <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">or</span><div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div></div>
              <form onSubmit={handleAuth} className="space-y-4">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white" placeholder="Email Address" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white" placeholder="Password" />
                {isLoginView && <button type="button" onClick={() => setIsForgotPasswordView(true)} className="w-full text-right text-[10px] font-bold text-slate-400 hover:text-slate-300 transition-colors">Forgot password?</button>}
                <button className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20">{isLoginView ? 'Sign In' : 'Create Account'}</button>
              </form>
              <div className="mt-8 text-center space-y-4">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{isLoginView ? "Don't have an account?" : "Already have an account?"}<button onClick={() => setIsLoginView(!isLoginView)} className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline">{isLoginView ? 'Sign Up' : 'Sign In'}</button></div>
                <button onClick={() => setShowAuth(false)} className="block w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-300 transition-colors text-center">Back to Welcome Page</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Removed API Key Required screen

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col h-screen overflow-hidden transition-colors">
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 xl:px-6 py-3 flex items-center justify-between shadow-sm shrink-0 relative transition-colors">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          <span className="text-xl font-bold tracking-tight">Our Digital <span className="text-indigo-600">Dwelling</span></span>
        </div>

        {/* Centered Credit Badge - Conditional: Meter vs Add Credits Button */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3">
          {userProfile?.credits === 0 ? (
            <button 
              onClick={() => setShowProfileMenu(true)}
              className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span className="text-xs font-black uppercase tracking-widest">Add Credits</span>
            </button>
          ) : (
            <button 
              onClick={() => setShowProfileMenu(true)}
              className={`flex flex-col items-center px-6 py-1.5 border rounded-full shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all outline-none ${isLowCredits ? 'bg-red-50 border-red-100 hover:bg-red-100 dark:bg-slate-900 dark:border-red-900/50 dark:hover:bg-slate-800' : isMediumCredits ? 'bg-yellow-50 border-yellow-100 hover:bg-yellow-100 dark:bg-slate-900 dark:border-yellow-900/50 dark:hover:bg-slate-800' : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100/80 dark:bg-slate-900 dark:border-indigo-900/50 dark:hover:bg-slate-800'}`}
            >
              <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 ${isLowCredits ? 'text-red-400 dark:text-red-500' : isMediumCredits ? 'text-yellow-500 dark:text-yellow-400' : 'text-indigo-400 dark:text-indigo-500'}`}>Credits Remaining</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-black ${isLowCredits ? 'text-red-600 dark:text-red-400' : isMediumCredits ? 'text-yellow-600 dark:text-yellow-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  {userProfile?.credits ?? '--'}
                </span>
                <div className={`w-16 h-1 rounded-full overflow-hidden ${isLowCredits ? 'bg-red-200 dark:bg-red-900/50' : isMediumCredits ? 'bg-yellow-200 dark:bg-yellow-900/50' : 'bg-indigo-200 dark:bg-indigo-900/50'}`}>
                  <div 
                    className={`h-full transition-all duration-700 ${isLowCredits ? 'bg-red-500 dark:bg-red-500' : isMediumCredits ? 'bg-yellow-500 dark:bg-yellow-500' : 'bg-indigo-600 dark:bg-indigo-500'}`} 
                    style={{ width: `${Math.min(100, ((userProfile?.credits || 0) / 20) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <>
              {selectedIds.size > 0 && (
                <button onClick={handleDeleteSelected} className="text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl flex items-center gap-2">Delete Selected ({selectedIds.size})</button>
              )}
              <button onClick={handleClearAll} className="text-xs font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-xl">Clear Project</button>
            </>
          )}
          <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-md">+ Add Photos</button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
              {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" alt="User" /> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 z-[100] transition-colors">
                {/* ... Profile Menu Content ... */}
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex justify-between items-start mb-1"><p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Account Profile</p><span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">{userProfile?.plan === 'free' ? 'Free' : (userProfile?.plan || 'Free')} Plan</span></div>
                  {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="mt-2 space-y-2">
                      <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500 dark:text-white" placeholder="Your Name" autoFocus />
                      <div className="flex gap-2"><button type="submit" className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-xl">Save Changes</button><button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold py-2 rounded-xl">Cancel</button></div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center"><div className="min-w-0"><p className="text-base font-bold text-slate-900 dark:text-white truncate">{userProfile?.name || user?.displayName || 'User'}</p><p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userProfile?.email || user?.email}</p></div><button onClick={() => setIsEditingProfile(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button></div>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <div className="space-y-0.5">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isLowCredits ? 'text-red-400' : isMediumCredits ? 'text-yellow-500' : 'text-slate-400'}`}>Credits Remaining</p>
                    </div>
                    <div className="flex gap-2">
                      {userProfile && ['Basic', 'Standard', 'Premium'].includes(userProfile.plan) ? (
                        <button onClick={() => { setShowManageSubscription(true); setShowProfileMenu(false); }} className="text-[9px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Manage my subscription plan</button>
                      ) : (
                        <button onClick={handleUpgradeSubscription} className="text-[9px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Choose Subscription Plan</button>
                      )}
                      <span className="text-slate-300">|</span>
                      {userProfile?.plan === 'free' ? (
                        <button onClick={() => { setShowCreditPacks(true); setShowProfileMenu(false); }} className="text-[9px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Pay as you Go Plan</button>
                      ) : (
                        <button onClick={handleAddCredits} className="text-[9px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Add Credits</button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2"><span className={`text-2xl font-black ${isLowCredits ? 'text-red-500' : isMediumCredits ? 'text-yellow-500' : 'text-slate-900 dark:text-white'}`}>{userProfile?.credits ?? '--'}</span><div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className={`h-full transition-all duration-500 ${isLowCredits ? 'bg-red-500' : isMediumCredits ? 'bg-yellow-500' : 'bg-indigo-600 dark:bg-indigo-500'}`} style={{ width: `${Math.min(100, ((userProfile?.credits || 0) / 20) * 100)}%` }}></div></div></div>
                </div>
                <div className="pt-2 flex flex-col gap-1">
                  {isAdmin && (
                    <button onClick={() => { setShowAdminDashboard(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl flex items-center gap-2 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                      Admin Dashboard
                    </button>
                  )}
                  <button onClick={() => { setShowMyProjects(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl flex items-center gap-2 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>My Projects</button>
                  <button onClick={() => { setShowCompliance(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl flex items-center gap-2 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>NAR/MLS Compliance</button>
                  <button onClick={() => { setShowTutorials(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl flex items-center gap-2 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/><path d="m5 21 0-18"/></svg>Watch Tutorials</button>
                  <button onClick={() => { setShowUserGuide(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl flex items-center gap-2 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>User Guide</button>
                  <button onClick={handleDeleteAccount} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl flex items-center gap-2 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>Delete Account</button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl flex items-center gap-2 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>Sign Out</button>
                </div>

                {/* Footer Section for Terms of Service, Refund, and Contact Us links at the bottom */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-center items-center gap-3 px-1">
                    <button onClick={() => { setShowTerms(true); setShowProfileMenu(false); }} className="text-[9px] font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline decoration-slate-200 dark:decoration-slate-700 underline-offset-2 whitespace-nowrap">Terms of Service</button>
                    <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></span>
                    <button onClick={() => { setShowRefundPolicy(true); setShowProfileMenu(false); }} className="text-[9px] font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline decoration-slate-200 dark:decoration-slate-700 underline-offset-2 whitespace-nowrap">Refund Policy</button>
                    <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></span>
                    <button onClick={() => { setShowContactUs(true); setShowProfileMenu(false); }} className="text-[9px] font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline decoration-slate-200 dark:decoration-slate-700 underline-offset-2 whitespace-nowrap">Contact Us</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ... (Payment Status Notification) ... */}
      {paymentStatus !== 'none' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[400] animate-in slide-in-from-top duration-300">
           <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 ${paymentStatus === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
             {paymentStatus === 'success' ? (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>)}
             <div className="pr-8 border-r border-white/20"><p className="text-sm font-black uppercase tracking-widest">{paymentStatus === 'success' ? 'Payment Successful' : 'Payment Failed'}</p><p className="text-[10px] font-bold opacity-80">{paymentStatus === 'success' ? 'Your credits will be added momentarily.' : 'There was an issue processing your order.'}</p></div>
             <button onClick={() => setPaymentStatus('none')} className="hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
           </div>
        </div>
      )}

      {/* ... (Main Content) ... */}
      {showAdminDashboard ? (
        <AdminDashboard onBack={() => setShowAdminDashboard(false)} />
      ) : showTutorials ? (
        <Tutorials onBack={() => setShowTutorials(false)} />
      ) : showCompliance ? (
        <MLSCompliance onBack={() => setShowCompliance(false)} />
      ) : (
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors">
        {items.length === 0 ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              src="/chronomorph_part_5.mp4" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 bg-white/75 dark:bg-slate-950/80 backdrop-blur-[1px]"></div>
            
            <div className="max-w-3xl mx-auto text-center px-6 relative z-10 w-full transform -translate-y-8">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight drop-shadow-sm">Virtual Staging <br/><span className="text-indigo-600 dark:text-indigo-400">Simplified.</span></h1>
              <div 
                onClick={() => fileInputRef.current?.click()} 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`group cursor-pointer border-3 border-dashed rounded-[3rem] p-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-all shadow-2xl ${isDragging ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-900/60 scale-[1.02]' : 'border-slate-300/80 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-900'}`}
              >
              <div className="flex flex-col items-center pointer-events-none">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-transform ${isDragging ? 'scale-110 bg-indigo-100 dark:bg-indigo-900/50' : 'bg-indigo-50 dark:bg-slate-800 group-hover:scale-110'}`}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600 dark:text-indigo-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg></div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{isDragging ? 'Drop Photos Now' : 'Upload or Drag and Drop photos'}</p>
                <p className="text-slate-400 dark:text-slate-500 mt-2 font-medium">Professional grade Virtual Staging</p>
              </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row h-full overflow-hidden">
            {/* ... (Sidebar and Image Area) ... */}
            <div 
              className={`w-full xl:w-64 bg-white dark:bg-slate-900 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden order-1 transition-colors ${isDragging ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
                {/* ... existing sidebar ... */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate pr-2">{activeProject?.name || "No Project"}</p>
                <button 
                  onClick={() => {
                    setCurrentProjectId(null);
                    setItems([]);
                    setActiveId(null);
                    setSelectedIds(new Set());
                  }} 
                  className="text-[8px] font-black text-white bg-slate-900 dark:bg-slate-700 px-3 py-1.5 rounded-full hover:bg-red-500 dark:hover:bg-red-500 uppercase tracking-widest shadow-sm transition-all flex items-center gap-1 shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Exit
                </button>
              </div>
              <div className="flex-1 overflow-x-auto xl:overflow-y-auto p-4 space-y-3 flex flex-row xl:flex-col gap-3 xl:gap-0 relative">
                {isDragging && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-indigo-600/5 dark:bg-indigo-400/10 backdrop-blur-[2px] pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-indigo-600 dark:text-indigo-400 animate-bounce mb-2"><path d="M12 2v10"/><path d="m16 8-4 4-4-4"/></svg>
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Drop to add</p>
                  </div>
                )}
                {items.map((item) => {
                  const selectedStyle = ALL_STYLES.find(s => s.id === item.currentStyle);
                  const isReady = item.currentStyle && item.staged[item.currentStyle];
                  return (
                    <div key={item.id} className={`relative group rounded-2xl border-2 transition-all cursor-pointer overflow-hidden shrink-0 w-24 h-24 xl:w-full xl:h-auto xl:aspect-[3/2] ${activeId === item.id ? 'border-indigo-600 dark:border-indigo-500 shadow-xl scale-[1.02]' : 'border-transparent'}`} onClick={() => setActiveId(item.id)}>
                      <div className="absolute top-2 left-2 z-10 cursor-pointer" onClick={(e) => toggleSelection(item.id, e)}>
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.has(item.id) ? 'bg-indigo-600 border-indigo-600 shadow-md' : 'bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600'}`}>{selectedIds.has(item.id) && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div>
                      </div>
                      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end pointer-events-none">{selectedStyle && <span className="bg-black text-white text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-lg">{selectedStyle.label}</span>}{isReady && <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-lg">Ready</span>}</div>
                      <img src={(item.currentStyle && item.staged[item.currentStyle]) || item.original} className="w-full h-full object-cover" alt="" />
                      {item.isProcessing && <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center z-20"><div className="w-6 h-6 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div></div>}
                      <button onClick={(e) => handleDownloadSingle(item.id, e)} className="absolute bottom-2 left-2 p-1.5 bg-black/50 hover:bg-indigo-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 backdrop-blur-sm shadow-sm" title="Download Image"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} className="absolute bottom-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 backdrop-blur-sm shadow-sm" title="Delete Image"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden xl:flex flex-col gap-2">
                <button onClick={handleDownloadStaged} disabled={items.length === 0} className="w-full bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-md">Download Staged Images</button>
                <button onClick={handleDownloadOriginals} disabled={items.length === 0} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-sm">Download Original Images</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 xl:p-8 order-2">
              <div className="max-w-4xl mx-auto space-y-6">
                {activeItem && (
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative group transition-colors">
                    <div className="aspect-[3/2] bg-slate-900 relative">
                      <img src={currentImage} className="w-full h-full object-contain" alt="" />
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full px-4"><div className="bg-black/30 backdrop-blur-md p-1.5 rounded-2xl flex gap-1 opacity-100 shadow-xl border border-white/10"><button onClick={() => setViewMode('original')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'original' ? 'bg-white text-slate-900 shadow-lg' : 'text-white hover:bg-white/10'}`}>Before</button><button disabled={!activeItem.currentStyle || !activeItem.staged[activeItem.currentStyle!]} onClick={() => setViewMode('staged')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'staged' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white/60'}`}>After</button></div></div>
                      {activeItem.watermarkText && viewMode === 'staged' && !showWatermarkMenu && (
                        <div onClick={() => setShowWatermarkMenu(true)} className="absolute bottom-6 right-6 bg-white/30 backdrop-blur-md text-black/70 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/40 z-10 flex items-center justify-center border border-white/10 shadow-sm transition-all duration-300">
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{activeItem.watermarkText}</span>
                        </div>
                      )}
                      {showWatermarkMenu && viewMode === 'staged' && (
                        <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-48 overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <div className="p-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Select Style</p>
                          </div>
                          <div className="flex flex-col p-2 gap-1">
                            {['Virtually Staged', 'Digitally Staged', 'Enhanced Image'].map(style => (
                              <button key={style} onClick={() => {
                                 const newItems = [...items];
                                 const idx = newItems.findIndex(i => i.id === activeItem.id);
                                 if (idx !== -1) { newItems[idx] = { ...newItems[idx], watermarkText: style }; setItems(newItems); }
                                 setShowWatermarkMenu(false);
                              }} className="text-[10px] font-bold text-slate-700 dark:text-slate-300 py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left uppercase tracking-wider">
                                {style}
                              </button>
                            ))}
                            <button onClick={() => setShowWatermarkMenu(false)} className="text-[10px] font-bold text-slate-400 py-2 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-center uppercase tracking-wider mt-1 border border-transparent">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* CREDIT ERROR MESSAGE CENTERED UNDER IMAGE */}
                    {hasInsufficientCredits && (
                      <div className="px-6 pt-4 flex justify-center">
                        <p className="text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wide text-center">
                          Insufficent credits remaining - Please add credits from the account profile tab.
                        </p>
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-3 items-center border-b border-slate-100 dark:border-slate-800 pb-3"><div className="min-w-0 pr-4"><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Source File</p><h2 className="text-base font-bold text-slate-900 dark:text-white truncate" title={activeItem.name}>{activeItem.name}</h2></div><div className="flex justify-center flex-wrap gap-2">{viewMode === 'staged' && activeItem.staged[activeItem.currentStyle!] && (<><button onClick={handleSaveVersion} className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-5 py-2 rounded-xl text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-2 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Save Version</button><button onClick={() => { if (activeItem.watermarkText) { const newItems = [...items]; const idx = newItems.findIndex(i => i.id === activeItem.id); if (idx !== -1) { newItems[idx] = { ...newItems[idx], watermarkText: undefined }; setItems(newItems); } } else { setShowWatermarkMenu(true); } }} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${activeItem.watermarkText ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>{activeItem.watermarkText ? 'Remove Watermark' : 'Add MLS Watermark'}</button></>)}</div><div className="flex justify-end"><button onClick={handleGenerateSelection} disabled={activeItem.isProcessing || !activeItem.currentStyle} className={`px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${hasInsufficientCredits || isOutOfCredits ? 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600' : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-500'}`}>{hasInsufficientCredits || isOutOfCredits ? 'Get Credits' : activeItem.isProcessing ? 'Generating...' : 'Generate'}</button></div></div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Image Type</label><div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1"><button onClick={() => handleCategorySwitch('interior')} className={`flex-1 py-[10px] text-xs font-black uppercase rounded-xl transition-all ${activeItem.styleCategory === 'interior' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}>Interior</button><button onClick={() => handleCategorySwitch('outdoor')} className={`flex-1 py-[10px] text-xs font-black uppercase rounded-xl transition-all ${activeItem.styleCategory === 'outdoor' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}>Exterior</button></div></div><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Staging Style</label><select value={activeItem.currentStyle || ''} onChange={(e) => handleSetStyleForSelection(e.target.value as StagingStyle)} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer"><option value="" disabled>Select a style...</option>{(activeItem.styleCategory === 'interior' ? INTERIOR_STYLES : OUTDOOR_STYLES).map(style => (<option key={style.id} value={style.id}>{style.label}</option>))}</select></div><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{activeItem.styleCategory === 'interior' ? 'Room Type' : 'Scene Type'}</label><select value={activeItem.roomType || ''} onChange={(e) => { const newItems = [...items]; const idx = newItems.findIndex(i => i.id === activeId); if (idx !== -1) { newItems[idx] = { ...newItems[idx], roomType: e.target.value as RoomType }; setItems(newItems); } }} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer"><option value="" disabled>Select a type...</option>{(activeItem.styleCategory === 'interior' ? INTERIOR_ROOM_TYPES : EXTERIOR_SCENE_TYPES).map(type => (<option key={type.id} value={type.id}>{type.label}</option>))}</select></div></div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 space-y-4"><div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Custom Refinement <span className="ml-1 normal-case opacity-70">(1 credit)</span></label><div className="flex gap-2"><button onClick={handleUndo} disabled={activeHistoryIdx <= 0} className="p-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 transition-colors" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v.5a2 2 0 0 1-2 2H12"/></svg></button><button onClick={handleRedo} disabled={activeHistoryIdx >= activeStyleHistory.length - 1} className="p-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 transition-colors" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v.5a2 2 0 0 0 2 2h6"/></svg></button></div></div><div className="flex gap-2"><input type="text" value={activeItem.refinementPrompt} onChange={(e) => { const newItems = [...items]; const idx = newItems.findIndex(i => i.id === activeId); if (idx !== -1) { newItems[idx] = { ...newItems[idx], refinementPrompt: e.target.value }; setItems(newItems); } }} placeholder="e.g., 'Add a white sectional sofa...'" className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm outline-none dark:text-white" /><button onClick={handleGenerateSelection} disabled={activeItem.isProcessing || !activeItem.currentStyle} className={`px-6 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${hasInsufficientCredits || isOutOfCredits ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600'}`}>Apply</button></div>{activeStyleHistory.length > 0 && (<div className="pt-2 border-t border-slate-200 dark:border-slate-700"><div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">{activeStyleHistory.map((h, i) => (<div key={h.id} onClick={() => handleJumpToHistory(i)} className={`group relative flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer transition-all border ${activeHistoryIdx === i ? 'bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-500 shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}><div className={`w-2.5 h-2.5 rounded-full shrink-0 border-2 ${activeHistoryIdx === i ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`} /><div className="flex-1 min-w-0"><p className="text-[11px] font-bold truncate">{h.prompt}</p><p className="text-[9px] text-slate-400 dark:text-slate-500">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>{activeHistoryIdx === i && <div className="bg-indigo-600 dark:bg-indigo-500 text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase">Current</div>}<button onClick={(e) => { e.stopPropagation(); handleDeleteRefinement(i); }} className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 dark:hover:text-red-400 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button></div>))}</div></div>)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden xl:flex xl:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-col h-full overflow-hidden order-3"><div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50"><h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Style Description</h2></div><div className="flex-1 overflow-y-auto p-4 space-y-6">{activeItem?.currentStyle ? ALL_STYLES.filter(style => style.id === activeItem.currentStyle && style.category === activeItem.styleCategory).map((style) => {
              // FREE TRIAL LOGIC: Show 1 Credit in sidebar if user is in free plan
              const currentCost = userProfile?.plan === 'free' ? 1 : (style.creditCost || 1);
              return (
              <div key={`${style.category}-${style.id}`} className="space-y-6">
                <div className="space-y-4">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-indigo-600 dark:border-indigo-500 shadow-xl"><img src={style.previewUrl} className="w-full h-full object-cover" alt="" /></div>
                  <div className="space-y-2 px-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{style.label}</h3>
                      <span className="shrink-0 text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-indigo-100 dark:border-indigo-800">{currentCost} {currentCost === 1 ? 'Credit' : 'Credits'}</span>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50"><p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">{style.description}</p></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Style Tips</h4>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 flex gap-3"><div className="text-amber-500 shrink-0 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></div><p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed font-medium italic whitespace-pre-line">{style.tips || "No specific tips available for this style yet."}</p></div>
                </div>
              </div>
            )}) : (<div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-300 dark:text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-4">Select a style.</p></div>)}</div></div>
          </div>
        )}
      </main>
      )}
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
      
      {showDownloadModal && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in duration-300">
            <button onClick={() => !isDownloading && setShowDownloadModal(false)} disabled={isDownloading} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400 disabled:opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="text-center mb-8">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Download Options</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Select the resolution for your staged photos.</p>
            </div>
            
            <div className="space-y-3 mb-8">
              <button 
                onClick={() => setDownloadResolution('2K')}
                disabled={isDownloading}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${downloadResolution === '2K' ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">High (2K)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Great for MLS and print</p>
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">Free</div>
              </button>

              <button 
                onClick={() => setDownloadResolution('4K')}
                disabled={isDownloading}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${downloadResolution === '4K' ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Ultra (4K)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Maximum quality, large files</p>
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">1 Credit / Photo</div>
              </button>
            </div>

            <button 
              onClick={confirmDownload} 
              disabled={isDownloading}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Download Now'
              )}
            </button>
          </div>
        </div>
      )}

      {showMyProjects && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <button onClick={() => setShowMyProjects(false)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="text-center mb-8 shrink-0">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Projects</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Select a project to reload.</p>
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
              {userProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {userProjects.map(project => (
                    <div 
                      key={project.id} 
                      onClick={() => handleLoadProject(project.id)}
                      className="group cursor-pointer bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                        <button 
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Project"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                        {project.thumbnailUrl ? (
                          <img src={project.thumbnailUrl} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-1">{project.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {project.createdAt?.toDate ? new Date(project.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                        {loadingProjectId === project.id ? (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Loading...</span>
                              <span className="text-xs font-bold text-slate-500">{loadingProjectProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${loadingProjectProgress}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 flex items-center text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                            Open Project <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m9 18 6-6-6-6"/></svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No projects yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Upload some photos to create your first project.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Organize Upload</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Would you like to create a new project for these photos?</p>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 ml-1">New Project Name</label>
                <input 
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="e.g., 123 Main St Listing"
                  className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-colors dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleConfirmProject(true)} 
                  disabled={!newProjectName.trim() || isCreatingProject}
                  className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {isCreatingProject ? 'Creating...' : 'Create & Upload'}
                </button>
                {currentProjectId && (
                   <button 
                    onClick={() => handleConfirmProject(false)} 
                    className="w-full bg-slate-900 dark:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                  >
                    Add to "{activeProject?.name}"
                  </button>
                )}
                <button 
                  onClick={() => handleConfirmProject(false)} 
                  className="w-full text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors py-2"
                >
                  Just Upload (No Project)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSubscriptionPlans && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          {/* ... (Plan Selection UI, unchanged) ... */}
           <div className="max-w-6xl w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 relative border border-white/20 animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button onClick={() => setShowSubscriptionPlans(false)} className="absolute top-8 right-8 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Monthly Subscription Plans</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">Choose a plan that scales with your business.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Plan Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{PRICING.basic_sub.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">Lite plan for individual agents.</p>
                <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{PRICING.basic_sub.price}</div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">per month</p>
                <ul className="space-y-4 mb-10 text-left w-full">
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold"><svg className="text-emerald-500 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>20 Monthly Credits ($1.50 per credit)</li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold"><svg className="text-emerald-500 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>All interior & Exterior Styles</li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold"><svg className="text-emerald-500 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>High Resolution Exports</li>
                </ul>
                <button onClick={() => selectSubscription('basic_sub')} className="w-full bg-slate-900 dark:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all mt-auto">Select Basic</button>
              </div>

              {/* Standard Plan Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-6 right-6 rotate-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Most Popular</div>
                <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{PRICING.standard_sub.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">For busy agents with multiple listings.</p>
                <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{PRICING.standard_sub.price}</div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">per month</p>
                <ul className="space-y-4 mb-10 text-left w-full">
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold"><svg className="text-emerald-500 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>45 Monthly Credits ($1.11 per credit)</li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold"><svg className="text-emerald-500 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>26% Savings per credit over Basic plan</li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold"><svg className="text-emerald-500 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>All interior & Exterior Styles</li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold"><svg className="text-emerald-500 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>High Resolution Exports</li>
                </ul>
                <button onClick={() => selectSubscription('standard_sub')} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all mt-auto">Select Standard</button>
              </div>

              {/* Premium Plan Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{PRICING.premium_sub.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">For power users and teams.</p>
                <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{PRICING.premium_sub.price}</div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">per month</p>
                <ul className="space-y-4 mb-10 text-left w-full">
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold"><svg className="text-emerald-500 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>100 Monthly Credits ($1.00 per credit)</li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold"><svg className="text-emerald-500 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>33% Savings per credit over Basic plan</li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold"><svg className="text-emerald-500 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>All interior & Exterior Styles</li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold"><svg className="text-emerald-500 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>High Resolution Exports</li>
                </ul>
                <button onClick={() => selectSubscription('premium_sub')} className="w-full bg-slate-900 dark:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all mt-auto">Select Premium</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreditPacks && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="max-w-6xl w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 relative border border-white/20 animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button onClick={() => setShowCreditPacks(false)} className="absolute top-8 right-8 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Pay As You Go</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">Purchase credit packs as needed.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['top_up_25', 'top_up_50', 'top_up_100'].map((key) => {
                const pack = PRICING[key as keyof typeof PRICING];
                return (
                  <div key={key} className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all">
                    <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{pack.name}</h3>
                    {pack.description && <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">{pack.description}</p>}
                    <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{pack.price}</div>
                    {(pack as any).perCredit && <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">{(pack as any).perCredit}</p>}
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">one-time payment</p>
                    <button onClick={() => { setPaymentType(key as any); setShowCreditPacks(false); setShowPaymentConfirm(true); }} className="w-full bg-slate-900 dark:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all mt-auto">Select Pack</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showManageSubscription && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in duration-300">
            <button onClick={() => setShowManageSubscription(false)} className="absolute top-8 right-8 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="text-center mb-8">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Manage Subscription</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Current Plan: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{userProfile?.plan}</span></p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => { setShowManageSubscription(false); setShowSubscriptionPlans(true); }}
                className="w-full bg-slate-900 dark:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
              >
                Change Subscription
              </button>
              <button 
                onClick={handleCancelSubscription}
                disabled={isUpgrading}
                className="w-full bg-white dark:bg-slate-900 border-2 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
              >
                {isUpgrading && <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin"></div>}
                Cancel Subscription
              </button>
            </div>
            <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">Need help? <button onClick={() => { setShowManageSubscription(false); setShowContactUs(true); }} className="text-indigo-600 dark:text-indigo-400 underline">Contact Support</button></p>
          </div>
        </div>
      )}

      {showPaymentConfirm && paymentType && (
        <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 relative border border-white/20 animate-in zoom-in duration-300">
            <button onClick={() => setShowPaymentConfirm(false)} className="absolute top-8 right-8 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="text-center mb-10">
              <div className="bg-indigo-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Confirm Payment</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{PRICING[paymentType].description}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 mb-10 border border-slate-100 dark:border-slate-800 shadow-inner">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Selected Plan</span>
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full text-right leading-tight max-w-[150px]">{PRICING[paymentType].name}</span>
              </div>
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Included Credits</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{PRICING[paymentType].credits} Credits</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Price</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{PRICING[paymentType].price}</span>
              </div>
            </div>
            <div className="space-y-4">
              <button onClick={handleFinalizePayment} disabled={isUpgrading} className="w-full bg-slate-900 dark:bg-slate-800 text-white font-black py-5 rounded-[2rem] shadow-2xl hover:bg-slate-800 dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg">
                {isUpgrading ? (<><div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>Preparing Checkout...</>) : 'Pay Now'}
              </button>
              <button onClick={() => setShowPaymentConfirm(false)} className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Return to Dashboard</button>
            </div>
            <p className="mt-10 text-[9px] text-slate-400 dark:text-slate-500 text-center leading-relaxed font-bold uppercase tracking-tighter">
              Secure processing by Stripe.
            </p>
          </div>
        </div>
      )}

      <footer className="shrink-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-6 px-6 text-center"><p className="text-slate-400 dark:text-slate-500 text-xs">© 2025 Our Digital Dwelling Inc. <button onClick={() => setShowTerms(true)} className="ml-4 hover:text-slate-600 dark:hover:text-slate-300 underline">Terms of Service</button><button onClick={() => setShowRefundPolicy(true)} className="ml-4 hover:text-slate-600 dark:hover:text-slate-300 underline">Refund Policy</button><button onClick={() => setShowContactUs(true)} className="ml-4 hover:text-slate-600 dark:hover:text-slate-300 underline">Contact Us</button></p></footer>
      {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}
      {showRefundPolicy && <RefundPolicy onClose={() => setShowRefundPolicy(false)} />}
      {showContactUs && <ContactUs onClose={() => setShowContactUs(false)} />}
      {showUserGuide && <UserGuide onClose={() => setShowUserGuide(false)} />}
    </div>
  );
};

export default App;
