import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuItem, MenuItemOption, CartItemOption } from "@shared/schema";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface OptionWithChildren extends MenuItemOption {
  children?: MenuItemOption[];
}

export function ProductDetailModal({ item, isOpen, onClose }: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('small');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Fetch options if the item has options
  const { data: flavorOptions } = useQuery<OptionWithChildren[]>({
    queryKey: ['/api/menu', item?.id, 'options'],
    queryFn: async () => {
      if (!item?.hasOptions) return [];
      try {
        const res = await apiRequest('GET', `/api/menu/${item.id}/options`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching options:", error);
        return [];
      }
    },
    enabled: !!item?.hasOptions
  });

  // Fetch favorite status
  const { data: favoriteStatus } = useQuery({
    queryKey: ['/api/favorites', item?.id],
    queryFn: async () => {
      if (!user || !item) return { isFavorite: false };
      try {
        const res = await apiRequest('GET', `/api/favorites/${item.id}`);
        return await res.json();
      } catch (error) {
        return { isFavorite: false };
      }
    },
    enabled: !!user && !!item
  });

  // Reset state when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen && item) {
      setSelectedSize('small');
      setQuantity(1);
      
      if (flavorOptions && flavorOptions.length > 0) {
        const initialOptions: Record<string, string> = {};
        
        // Add a "Flavor" key for standalone flavor options, but don't select any by default
        if (flavorOptions.filter(opt => !opt.isParent && !opt.parentId).length > 0) {
          initialOptions["Flavor"] = "";
        }
        
        setSelectedOptions(initialOptions);
      } else {
        setSelectedOptions({});
      }
    }
  }, [isOpen, item, flavorOptions]);

  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!item) return;
      const res = await apiRequest('POST', '/api/favorites', { menuItemId: item.id });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', item?.id] });
      toast({
        title: "Added to favorites",
        description: `${item?.name} has been added to your favorites.`,
      });
    }
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!item) return;
      const res = await apiRequest('DELETE', `/api/favorites/${item.id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', item?.id] });
      toast({
        title: "Removed from favorites",
        description: `${item?.name} has been removed from your favorites.`,
      });
    }
  });

  const toggleFavorite = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to add items to favorites.",
        variant: "destructive",
      });
      return;
    }

    if (favoriteStatus?.isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  const getSelectedOptionsWithPrices = (): CartItemOption[] => {
    if (!flavorOptions || flavorOptions.length === 0) return [];
    
    const result: CartItemOption[] = [];
    
    flavorOptions.forEach(option => {
      if (option.isParent && option.children) {
        const selectedChildName = selectedOptions[option.name];
        if (selectedChildName) {
          const selectedChild = option.children.find(child => child.name === selectedChildName);
          if (selectedChild) {
            result.push({
              name: option.name,
              value: selectedChild.name,
              priceAdjustment: selectedChild.priceAdjustment || 0
            });
          }
        }
      } else if (!option.parentId && !option.isParent) {
        if (selectedOptions["Flavor"] === option.name) {
          result.push({
            name: "Flavor",
            value: option.name,
            priceAdjustment: option.priceAdjustment || 0
          });
        }
      }
    });
    
    return result;
  };

  const getTotalOptionPriceAdjustment = (): number => {
    const selectedOptionsList = getSelectedOptionsWithPrices();
    return selectedOptionsList.reduce((total, opt) => total + opt.priceAdjustment, 0);
  };

  const getPrice = (): number => {
    if (!item) return 0;
    
    let basePrice = item.price;
    
    if (item.hasSizes) {
      switch (selectedSize) {
        case 'small': basePrice = item.price; break;
        case 'medium': basePrice = item.mediumPrice || item.price * 1.25; break;
        case 'large': basePrice = item.largePrice || item.price * 1.5; break;
      }
    }
    
    const optionAdjustments = getTotalOptionPriceAdjustment();
    return basePrice + optionAdjustments;
  };

  const handleAddToCart = () => {
    if (!item) return;
    
    const optionsList = getSelectedOptionsWithPrices();
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        menuItemId: item.id,
        name: item.name,
        price: getPrice(),
        quantity: 1,
        imageUrl: item.imageUrl || undefined,
        size: item.hasSizes ? selectedSize : undefined,
        options: optionsList
      });
    }
    
    let message = `Added ${quantity}x ${item.name}`;
    if (item.hasSizes) message += ` (${selectedSize})`;
    
    if (optionsList.length > 0) {
      const optionText = optionsList.map(opt => `${opt.value}`).join(', ');
      message += ` with ${optionText}`;
    }
    
    toast({
      title: "Added to cart",
      description: message
    });
    
    onClose();
  };

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-4 flex justify-between items-center rounded-t-3xl z-10">
              <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 h-auto"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 pb-24">
              {/* Product Image and Info */}
              <div className="relative z-0">
                <div className="aspect-video w-full bg-gray-100 rounded-2xl overflow-hidden mb-4">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-700">
                      <span className="text-lg font-medium">No Image Available</span>
                    </div>
                  )}
                </div>

                {/* Heart Icon */}
                {user && (
                  <button 
                    onClick={toggleFavorite}
                    className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <Heart 
                      className={`h-5 w-5 ${favoriteStatus?.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                    />
                  </button>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      ${getPrice().toFixed(2)}
                    </span>
                    {(item.hasSizes || item.hasOptions) && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Customizable
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              {item.hasSizes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Choose Size</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <RadioGroup value={selectedSize} onValueChange={(value) => setSelectedSize(value as 'small' | 'medium' | 'large')}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="small" id="small" />
                        <Label htmlFor="small" className="flex-1">
                          <div className="flex justify-between">
                            <span>Small</span>
                            <span className="font-semibold">${item.price.toFixed(2)}</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="flex-1">
                          <div className="flex justify-between">
                            <span>Medium</span>
                            <span className="font-semibold">${(item.mediumPrice || item.price * 1.25).toFixed(2)}</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="large" id="large" />
                        <Label htmlFor="large" className="flex-1">
                          <div className="flex justify-between">
                            <span>Large</span>
                            <span className="font-semibold">${(item.largePrice || item.price * 1.5).toFixed(2)}</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              )}

              {/* Options Selection */}
              {item.hasOptions && flavorOptions && flavorOptions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Customize Your Order</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    {/* Parent options with children */}
                    {flavorOptions.filter(opt => opt.isParent && opt.children && opt.children.length > 0).map((parentOption) => (
                      <div key={parentOption.id}>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          {parentOption.name} (Optional)
                        </Label>
                        <Select 
                          value={selectedOptions[parentOption.name] || ''} 
                          onValueChange={(value) => {
                            setSelectedOptions(prev => ({
                              ...prev,
                              [parentOption.name]: value
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Choose ${parentOption.name}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {parentOption.children?.map((childOption) => (
                              <SelectItem key={childOption.id} value={childOption.name}>
                                <div className="flex justify-between w-full">
                                  <span>{childOption.name}</span>
                                  {typeof childOption.priceAdjustment === 'number' && childOption.priceAdjustment > 0 && (
                                    <span className="ml-2">+${childOption.priceAdjustment.toFixed(2)}</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    
                    {/* Standard flavor options */}
                    {flavorOptions.filter(opt => !opt.isParent && !opt.parentId).length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Flavor (Optional)
                        </Label>
                        <Select 
                          value={selectedOptions["Flavor"] || ''} 
                          onValueChange={(value) => {
                            setSelectedOptions(prev => ({
                              ...prev,
                              "Flavor": value
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose Flavor" />
                          </SelectTrigger>
                          <SelectContent>
                            {flavorOptions
                              .filter(opt => !opt.isParent && !opt.parentId)
                              .map((option) => (
                                <SelectItem key={option.id} value={option.name}>
                                  <div className="flex justify-between w-full">
                                    <span>{option.name}</span>
                                    {typeof option.priceAdjustment === 'number' && option.priceAdjustment > 0 && (
                                      <span className="ml-2">+${option.priceAdjustment.toFixed(2)}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quantity Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quantity</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">How many would you like?</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Sticky Add to Cart Footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-6 z-10">
              <Button 
                onClick={handleAddToCart} 
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 h-auto rounded-xl shadow-lg"
              >
                Add to Cart • ${(getPrice() * quantity).toFixed(2)}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}