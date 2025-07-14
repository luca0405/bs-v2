import { Card } from "@/components/ui/card";
import { MenuItem } from "@shared/schema";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GrabMenuCardProps {
  item: MenuItem;
  onClick: () => void;
}

export function GrabMenuCard({ item, onClick }: GrabMenuCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: favoriteStatus } = useQuery({
    queryKey: ['/api/favorites', item.id],
    queryFn: async () => {
      if (!user) return { isFavorite: false };
      try {
        const res = await apiRequest('GET', `/api/favorites/${item.id}`);
        return await res.json();
      } catch (error) {
        return { isFavorite: false };
      }
    },
    enabled: !!user
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/favorites', { menuItemId: item.id });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', item.id] });
      toast({
        title: "Added to favorites",
        description: `${item.name} has been added to your favorites.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add favorite",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/favorites/${item.id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', item.id] });
      toast({
        title: "Removed from favorites",
        description: `${item.name} has been removed from your favorites.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove favorite",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
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

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 bg-white"
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="aspect-square w-full bg-gray-100 relative overflow-hidden">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-700">
            <span className="text-sm font-medium text-center px-3">No Image</span>
          </div>
        )}
        
        {/* Heart Icon */}
        {user && (
          <button 
            onClick={toggleFavorite}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
            aria-label={favoriteStatus?.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={`h-4 w-4 ${favoriteStatus?.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
            />
          </button>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2 leading-tight">
          {item.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-green-600 text-sm">
            ${item.price.toFixed(2)}
          </span>
          {(item.hasSizes || item.hasOptions) && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Options
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}